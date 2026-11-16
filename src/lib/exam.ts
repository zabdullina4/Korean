// Проверка экзамена и правила пересдачи.
import { spellToChoice, type ExamDef, type ExamQuestion, type ExamSection, type SectionKey, type WriteItem } from '../content/exam';
import type { ChoiceItem } from '../content/types';
import { noteKey, type ErrorNote } from './notebook';
import { hash, rng } from './random';
import { topikLength } from './wongoji';
import { styleIssues } from './writing';

export type Answer = number | string[] | string | null;

export interface ExamAttempt {
  at: string;
  seed: number;
  correct: number;
  total: number;
  passed: boolean;
  sections: { key: SectionKey; right: number; total: number }[];
  wrongNoteIds: string[];
  /** Итог достаточен, но письмо ниже минимума `ExamDef.minWriting` — экзамен не сдан. */
  writingShort?: boolean;
}

export interface WritingScore {
  item: WriteItem;
  text: string;
  earned: number;
  max: number;
  notes: string[];
}

export interface Graded {
  attempt: ExamAttempt;
  /** Ошибки в виде заданий с выбором — для 오답노트. */
  mistakes: { item: ChoiceItem; wrong: string }[];
  /** Разбор письменных заданий. */
  writing: WritingScore[];
}

/**
 * Автооценка письма по трём равным частям: объём, стиль 한다체, ключевые данные из условия.
 * Содержание и связность автоматически не оцениваются — для этого ученик сверяется с образцом.
 */
export function gradeWriting(item: WriteItem, text: string, max: number): WritingScore {
  const part = max / 3;
  const notes: string[] = [];
  const n = topikLength(text.trim());
  let lengthPts = 0;
  if (n >= item.min && n <= item.max) lengthPts = part;
  else if (n >= item.min * 0.5 && n <= item.max * 1.2) {
    lengthPts = part / 2;
    notes.push(`Объём ${n} знаков — нужно ${item.min}–${item.max}.`);
  } else notes.push(n ? `Объём ${n} знаков — сильно вне нормы ${item.min}–${item.max}.` : 'Ответ не написан.');
  const issues = n ? styleIssues(text) : [];
  const stylePts = !n ? 0 : issues.length === 0 ? part : issues.length === 1 ? part / 2 : 0;
  for (const i of issues) notes.push(`${i.text}: ${i.hint}`);
  const found = item.keywords.filter((alts) => alts.some((k) => text.includes(k))).length;
  const keyPts = item.keywords.length ? (found / item.keywords.length) * part : part;
  if (found < item.keywords.length) {
    const missing = item.keywords.filter((alts) => !alts.some((k) => text.includes(k))).map((a) => a[0]);
    notes.push(`Не хватает данных из условия: ${missing.join(', ')}.`);
  }
  return { item, text, earned: Math.round(lengthPts + stylePts + keyPts), max, notes };
}

export function seedFor(examId: string, attemptNo: number): number {
  return hash(`${examId}#${attemptNo}`);
}

export function isRight(q: ExamQuestion, a: Answer): boolean {
  if (a === null) return false;
  if (q.kind === 'choice') return a === q.item.answer;
  if (q.kind === 'write') return false;
  return Array.isArray(a) && a.join('') === q.item.target.join('');
}

export function grade(exam: ExamDef, seed: number, sections: ExamSection[], answers: Answer[][], now = new Date()): Graded {
  const r = rng(seed ^ 0x5eed);
  const mistakes: Graded['mistakes'] = [];
  const writing: WritingScore[] = [];
  let correct = 0;
  let total = 0;
  const per = sections.map((sec, si) => {
    let right = 0;
    let possible = 0;
    sec.questions.forEach((q, qi) => {
      const a = answers[si]?.[qi] ?? null;
      const pts = q.points ?? 1;
      possible += pts;
      if (q.kind === 'write') {
        const w = gradeWriting(q.item, typeof a === 'string' ? a : '', pts);
        writing.push(w);
        right += w.earned;
        return;
      }
      if (isRight(q, a)) right += pts;
      else if (q.kind === 'choice') mistakes.push({ item: q.item, wrong: a === null ? '— нет ответа —' : q.item.options[a as number] });
      else mistakes.push({ item: spellToChoice(q.item, r), wrong: Array.isArray(a) && a.length ? a.join('') : '— нет ответа —' });
    });
    correct += right;
    total += possible;
    return { key: sec.key, right, total: possible };
  });
  // TOPIK II: каждый раздел — 100 баллов, итог — их сумма.
  if (exam.perSection && exam.scale) {
    const each = exam.scale / per.length;
    correct = Math.round(per.reduce((acc, s) => acc + (s.total ? (s.right / s.total) * each : 0), 0));
    total = exam.scale;
  }
  const enough = total > 0 && correct / total >= exam.pass;
  const writingShort = exam.minWriting !== undefined && writing.some((w) => w.earned < w.max * exam.minWriting!);
  const attempt: ExamAttempt = {
    at: now.toISOString(),
    seed,
    correct,
    total,
    passed: enough && !writingShort,
    sections: per,
    wrongNoteIds: mistakes.map((m) => noteKey(exam.id, m.item)),
    ...(writingShort ? { writingShort } : {}),
  };
  return { attempt, mistakes, writing };
}

/** После провала пересдача открывается, когда каждая ошибка экзамена отработана в 보충수업. */
export function retakeStatus(last: ExamAttempt | undefined, notes: Record<string, ErrorNote>): { ok: boolean; left: number } {
  if (!last || last.passed) return { ok: true, left: 0 };
  const left = last.wrongNoteIds.filter((id) => {
    const n = notes[id];
    return n && !n.closedAt && !(n.lastAnsweredAt && n.lastAnsweredAt > last.at);
  }).length;
  return { ok: left === 0, left };
}
