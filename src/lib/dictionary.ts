// Словарь приложения: базовые статьи + слова уроков, обратный индекс форм и примеры из уроков.
import { plain } from './rich';
import { LESSONS } from '../content/catalog';
import { BASE_DICTIONARY, type DictEntry, type Pos } from '../content/dictionary';
import type { Lesson } from '../content/types';
import { analyzeNoun, buildVerbIndex, type Analysis } from './morph';

export interface Example {
  kr: string;
  ru?: string;
  lessonId: string;
}

interface Index {
  entries: DictEntry[];
  byLemma: Map<string, DictEntry>;
  verbs: Map<string, Analysis[]>;
  examples: Map<string, Example[]>;
}

let cache: Index | null = null;

function guessPos(kr: string): Pos {
  if (/[요다]$/.test(kr) && /(요|니다)$/.test(kr)) return 'expr';
  if (kr.includes(' ')) return 'expr';
  if (kr.endsWith('다') && kr.length > 1) return 'v';
  return 'n';
}

function mergeLessonWords(base: DictEntry[], lessons: Lesson[]): DictEntry[] {
  const byLemma = new Map(base.map((e) => [e.lemma, { ...e }]));
  for (const l of lessons)
    for (const w of l.words) {
      const e = byLemma.get(w.kr);
      if (e) {
        e.wordId ??= w.id;
        e.lessonId ??= l.id;
        e.pron ??= w.pron;
      } else byLemma.set(w.kr, { lemma: w.kr, pos: guessPos(w.kr), ru: w.ru, level: l.grade, pron: w.pron, wordId: w.id, lessonId: l.id });
    }
  return [...byLemma.values()];
}

/** Все корейские предложения уроков с переводом — для примеров в статьях. */
export function lessonSentences(lessons: Lesson[]): Example[] {
  const out: Example[] = [];
  for (const l of lessons)
    for (const s of l.steps) {
      if (s.kind === 'dialogue') for (const d of s.lines) out.push({ kr: plain(d.kr), ru: d.ru, lessonId: l.id });
      if (s.kind === 'build') out.push({ kr: s.target.join(s.target.every((t) => t.length === 1) ? '' : ' '), ru: s.ru, lessonId: l.id });
      if (s.kind === 'choice')
        for (const it of s.items)
          if (it.prompt.includes('___') && !it.prompt.includes('\n') && /[가-힣]/.test(it.prompt))
            out.push({ kr: it.prompt.replace('___', it.options[it.answer]), ru: it.ru, lessonId: l.id });
    }
  return out;
}

export const tokenize = (s: string) =>
  s
    .replace(/[.,!?…"“”'«»()~:;]/g, ' ')
    .split(/\s+/)
    .filter((t) => /[가-힣]/.test(t));

function build(): Index {
  const entries = mergeLessonWords(BASE_DICTIONARY, LESSONS);
  const byLemma = new Map(entries.map((e) => [e.lemma, e]));
  const verbs = buildVerbIndex(entries);
  const idx: Index = { entries, byLemma, verbs, examples: new Map() };
  for (const ex of lessonSentences(LESSONS)) {
    const seen = new Set<string>();
    for (const tok of tokenize(ex.kr))
      for (const a of analyzeWith(idx, tok).filter((x) => x.entry)) {
        if (seen.has(a.lemma)) continue;
        seen.add(a.lemma);
        const list = idx.examples.get(a.lemma) ?? [];
        const norm = (t: string) => t.replace(/[^가-힣]/g, '');
        if (list.length < 8 && !list.some((x) => norm(x.kr) === norm(ex.kr))) list.push(ex);
        idx.examples.set(a.lemma, list);
      }
  }
  return idx;
}

export function dict(): Index {
  return (cache ??= build());
}

function analyzeWith(idx: Index, token: string): Analysis[] {
  const res: Analysis[] = [];
  const exact = idx.byLemma.get(token);
  if (exact) res.push({ surface: token, lemma: token, pos: exact.pos, entry: exact, chain: [{ form: token, kind: 'stem', gloss: exact.ru }], note: 'словарная форма', score: 20 });
  res.push(...(idx.verbs.get(token) ?? []));
  res.push(...analyzeNoun(token, (l) => idx.byLemma.get(l)));
  // Неизвестные основы показываем, только если ничего известного не нашлось.
  const known = res.filter((a) => a.entry);
  const list = known.length ? known : res.filter((a) => a.chain.length > 1).slice(0, 2);
  const uniq = new Map<string, Analysis>();
  for (const a of list.sort((x, y) => y.score - x.score)) {
    const key = `${a.lemma}|${a.chain.map((m) => m.form).join('+')}`;
    if (!uniq.has(key)) uniq.set(key, a);
  }
  return [...uniq.values()].slice(0, 6);
}

/** Разбор одной словоформы. */
export function analyze(token: string): Analysis[] {
  return analyzeWith(dict(), token.trim());
}

export interface SearchResult {
  /** Разбор по словам, если запрос корейский. */
  tokens: { token: string; analyses: Analysis[] }[];
  /** Статьи словаря, подходящие к запросу. */
  entries: DictEntry[];
}

const CYR = /[а-яё]/i;

export function search(q: string): SearchResult {
  const query = q.trim();
  if (!query) return { tokens: [], entries: [] };
  const idx = dict();
  if (CYR.test(query)) {
    const needle = query.toLowerCase();
    const scored = idx.entries
      .map((e) => {
        const ru = e.ru.toLowerCase();
        const words = ru.split(/[^а-яё]+/);
        const s = words.includes(needle) ? 3 : words.some((w) => w.startsWith(needle)) ? 2 : ru.includes(needle) ? 1 : 0;
        return { e, s };
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.level - b.e.level || a.e.lemma.length - b.e.lemma.length);
    return { tokens: [], entries: scored.slice(0, 30).map((x) => x.e) };
  }
  const tokens = tokenize(query).map((token) => ({ token, analyses: analyze(token) }));
  const lemmas = new Set(tokens.flatMap((t) => t.analyses.filter((a) => a.entry).map((a) => a.lemma)));
  const prefix = idx.entries.filter((e) => !lemmas.has(e.lemma) && tokens.length === 1 && e.lemma.startsWith(tokens[0].token) && e.lemma !== tokens[0].token);
  return {
    tokens,
    entries: [...[...lemmas].map((l) => idx.byLemma.get(l)!), ...prefix.slice(0, 12)],
  };
}

export function entry(lemma: string): DictEntry | undefined {
  return dict().byLemma.get(lemma);
}

export function examples(lemma: string): Example[] {
  return dict().examples.get(lemma) ?? [];
}
