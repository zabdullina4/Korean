import { consonantsBasic, consonantsTriples } from './grade0/consonants';
import { batchim, syllableBlocks } from './grade0/syllables';
import { vowelsBasic, vowelsY } from './grade0/vowels';
import { aniyeyo, eunneun, iyeyo } from './grade1/unit1';
import { igeot, isseoyo, ui } from './grade1/unit2';
import { eeseo, eulreul, presentTense } from './grade1/unit3';
import { prices, sinoNumbers } from './grade1/unit4';
import { reasonAseoNiga } from './grade2/reason';
import type { ExamDef } from './exam';
import { prepExam } from './exams/prep';
import type { Grade, Lesson } from './types';

const G0 = [vowelsBasic, vowelsY, consonantsBasic, consonantsTriples, syllableBlocks, batchim];
const G1 = [iyeyo, eunneun, aniyeyo, igeot, isseoyo, ui, presentTense, eulreul, eeseo, sinoNumbers, prices];

export const LESSONS: Lesson[] = [...G0, ...G1, reasonAseoNiga];

/** Переводной экзамен каждого класса. */
export const EXAMS: Record<number, ExamDef> = { 0: prepExam };
export const EXAM_BY_ID: Record<string, ExamDef> = Object.fromEntries(Object.values(EXAMS).map((e) => [e.id, e]));

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
  {
    n: 1,
    name: '1급',
    ru: 'Начальная школа · 1 класс',
    units: [
      { grade: 1, n: 1, title: 'Знакомство', titleKr: '소개', lessons: [iyeyo.id, eunneun.id, aniyeyo.id] },
      { grade: 1, n: 2, title: 'Вещи и семья', titleKr: '물건과 가족', lessons: [igeot.id, isseoyo.id, ui.id] },
      { grade: 1, n: 3, title: 'Мой день', titleKr: '하루', lessons: [presentTense.id, eulreul.id, eeseo.id] },
      { grade: 1, n: 4, title: 'Числа и цены', titleKr: '숫자와 가격', lessons: [sinoNumbers.id, prices.id] },
      { grade: 1, n: 5, title: 'Время и исконные числа', titleKr: '시간', lessons: [] },
      { grade: 1, n: 6, title: 'Прошедшее время', titleKr: '과거', lessons: [] },
      { grade: 1, n: 7, title: 'Отрицание 안 / 못', titleKr: '부정', lessons: [] },
      { grade: 1, n: 8, title: 'Планы и желания', titleKr: '계획', lessons: [] },
      { grade: 1, n: 9, title: 'Просьбы и предложения', titleKr: '부탁', lessons: [] },
      { grade: 1, n: 10, title: 'Официальный стиль 합니다', titleKr: '격식체', lessons: [] },
    ],
  },
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
