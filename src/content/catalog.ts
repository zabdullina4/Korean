import { consonantsBasic, consonantsTriples } from './grade0/consonants';
import { batchim, syllableBlocks } from './grade0/syllables';
import { vowelsBasic, vowelsY } from './grade0/vowels';
import { reasonAseoNiga } from './grade2/reason';
import type { Grade, Lesson } from './types';

export const LESSONS: Lesson[] = [vowelsBasic, vowelsY, consonantsBasic, consonantsTriples, syllableBlocks, batchim, reasonAseoNiga];

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

export const GRADES: Grade[] = [
  {
    n: 0,
    name: '예비반',
    ru: 'Подготовительный класс · Хангыль',
    units: [
      { grade: 0, n: 1, title: 'Гласные', titleKr: '모음', lessons: [vowelsBasic.id, vowelsY.id] },
      { grade: 0, n: 2, title: 'Согласные', titleKr: '자음', lessons: [consonantsBasic.id, consonantsTriples.id] },
      { grade: 0, n: 3, title: 'Слог и патчим', titleKr: '음절과 받침', lessons: [syllableBlocks.id, batchim.id] },
    ],
  },
  { n: 1, name: '1급', ru: 'Начальная школа · 1 класс', units: [] },
  {
    n: 2,
    name: '2급',
    ru: 'Начальная школа · 2 класс',
    units: [{ grade: 2, n: 7, title: 'Здоровье', titleKr: '건강', lessons: [reasonAseoNiga.id] }],
  },
  { n: 3, name: '3급', ru: 'Средняя школа · 1 класс', units: [] },
  { n: 4, name: '4급', ru: 'Средняя школа · 2 класс', units: [] },
  { n: 5, name: '5급', ru: 'Старшая школа · 1 класс', units: [] },
  { n: 6, name: '6급', ru: 'Старшая школа · 2 класс', units: [] },
];

/** Уроки класса в порядке программы. */
export function gradeLessons(grade: number): Lesson[] {
  const g = GRADES.find((x) => x.n === grade);
  return g ? g.units.flatMap((u) => u.lessons.map((id) => LESSON_BY_ID[id])) : [];
}

/** Уроки 2급 пока доступны только как превью: программа класса ещё не наполнена. */
export function isPreviewLesson(l: Lesson): boolean {
  return l.grade === 2;
}
