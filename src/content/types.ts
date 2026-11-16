// Модель учебного контента. Тексты поддерживают мини-разметку [[класс|текст]] — см. components/Rich.tsx.
// Классы: a, b (подсветка двух сравниваемых форм), no, yes, kr (корейский шрифт), p (частица), e (окончание).

export type SkillKey = 'read' | 'listen' | 'write' | 'speak' | 'core';

export type ErrorType =
  | 'particle'
  | 'ending'
  | 'politeness'
  | 'word-order'
  | 'spelling'
  | 'vocab'
  | 'pronunciation'
  | 'letter';

export const ERROR_LABEL: Record<ErrorType, string> = {
  particle: 'Частица',
  ending: 'Окончание',
  politeness: 'Вежливость',
  'word-order': 'Порядок слов',
  spelling: 'Орфография',
  vocab: 'Лексика',
  pronunciation: 'Произношение',
  letter: 'Буквы и звуки',
};

export interface Word {
  id: string;
  kr: string;
  ru: string;
  /** Подсказка произношения, если читается не так, как пишется: [궁물] */
  pron?: string;
  note?: string;
}

export interface DialogueLine {
  who: string;
  kr: string;
  ru: string;
  me?: boolean;
}

export interface ChoiceItem {
  /** Текст задания; ___ — место пропуска. */
  prompt: string;
  ru?: string;
  /** Если задано — задание на слух: текст озвучивается, а не показывается. */
  audio?: string;
  options: string[];
  answer: number;
  why: string;
  errorType: ErrorType;
}

export interface LetterCard {
  char: string;
  /** Что произнести синтезатором (слог с этой буквой). */
  say: string;
  name?: string;
  hint: string;
}

export type Step =
  | { kind: 'dialogue'; title: string; sub?: string; lines: DialogueLine[]; note?: string }
  | { kind: 'board'; title: string; sub?: string; lines: string[]; table?: { head: string[]; rows: string[][] }; note?: string }
  | { kind: 'letters'; title: string; sub?: string; letters: LetterCard[]; note?: string }
  | { kind: 'choice'; title: string; sub?: string; items: ChoiceItem[] }
  | {
      kind: 'build';
      title: string;
      sub?: string;
      ru: string;
      target: string[];
      pool: string[];
      hints: { ifIncludes: string; why: string }[];
      errorType: ErrorType;
    }
  | { kind: 'compose'; title: string; sub?: string; palette: { cho: string[]; jung: string[]; jong?: string[] }; tasks: { target: string; ru?: string }[] }
  /** Граф корня ханча: корень в центре, вокруг — слова с ним. */
  | { kind: 'hanja'; title: string; sub?: string; roots: HanjaRoot[]; note?: string }
  /** Текст, разложенный по бланку 원고지. */
  | { kind: 'wongoji'; title: string; sub?: string; text: string; note?: string }
  /** Свободное письмо с проверкой длины и стиля и образцом ответа. */
  | { kind: 'write'; title: string; sub?: string; task: string; min: number; max: number; model: string; checklist: string[] };

export interface HanjaWord {
  kr: string;
  hanja: string;
  ru: string;
}

export interface HanjaRoot {
  char: string;
  sound: string;
  meaning: string;
  words: HanjaWord[];
}

export interface Lesson {
  id: string;
  grade: number;
  unit: number;
  title: string;
  /** Короткое название для расписания. */
  short: string;
  minutes: number;
  skill: SkillKey;
  words: Word[];
  steps: Step[];
  /** Итоговая заметка на экране «урок окончен». */
  outro?: string;
}

export interface Unit {
  grade: number;
  n: number;
  title: string;
  titleKr: string;
  lessons: string[];
}

export interface Grade {
  n: number;
  name: string;
  ru: string;
  units: Unit[];
}
