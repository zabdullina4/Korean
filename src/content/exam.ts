import { shuffle } from '../lib/random';
import type { ChoiceItem } from './types';

/** Задание «запишите услышанное» из слоговых блоков. alts — типичные ошибки для тетради ошибок. */
export interface SpellItem {
  audio: string;
  ru?: string;
  target: string[];
  pool: string[];
  alts: string[];
}

export type ExamQuestion = { kind: 'choice'; item: ChoiceItem } | { kind: 'spell'; item: SpellItem };

export type SectionKey = 'listen' | 'read' | 'write';

export interface ExamSection {
  key: SectionKey;
  kr: string;
  ru: string;
  questions: ExamQuestion[];
}

export interface ExamDef {
  id: string;
  grade: number;
  title: string;
  titleKr: string;
  minutes: number;
  /** Доля верных ответов для зачёта (0..1). */
  pass: number;
  /** Сколько раз можно прослушать аудио в задании. */
  plays: number;
  make(seed: number): ExamSection[];
}

/** Перемешать варианты ответа, сохранив правильный. */
export function shuffleOptions(item: ChoiceItem, r: () => number): ChoiceItem {
  const right = item.options[item.answer];
  const options = shuffle(item.options, r);
  return { ...item, options, answer: options.indexOf(right) };
}

/** Ошибка в диктанте записывается в 오답노트 как задание с выбором написания. */
export function spellToChoice(it: SpellItem, r: () => number): ChoiceItem {
  const right = it.target.join('');
  const options = shuffle([right, ...it.alts], r);
  return {
    prompt: '___',
    audio: it.audio,
    ru: it.ru,
    options,
    answer: options.indexOf(right),
    why: `Пишется [[kr|${right}]]${it.ru ? ` — ${it.ru}` : ''}.`,
    errorType: 'spelling',
  };
}

export function questionCount(sections: ExamSection[]): number {
  return sections.reduce((a, s) => a + s.questions.length, 0);
}
