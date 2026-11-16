import { consonantsBasic, consonantsTriples } from './grade0/consonants';
import { batchim, syllableBlocks } from './grade0/syllables';
import { vowelsBasic, vowelsY } from './grade0/vowels';
import { aniyeyo, eunneun, iyeyo } from './grade1/unit1';
import { igeot, isseoyo, ui } from './grade1/unit2';
import { eeseo, eulreul, presentTense } from './grade1/unit3';
import { prices, sinoNumbers } from './grade1/unit4';
import { nativeNumbers, negationAn, negationMot, pastTense, telling, weekend } from './grade1/unit5-7';
import { announcement, formal, future, lkkayo, seyo, want } from './grade1/unit8-10';
import { reasonAseoNiga } from './grade2/reason';
import { butIf, canDo, experience, mustDo, plans, progressive, reo, tryIt } from './grade2/unit1-4';
import { attrAdj, attrTense, attrVerb } from './grade2/unit5';
import { beforeAfter, when, whileDoing } from './grade2/unit6';
import { because, permission, symptoms } from './grade2/unit7';
import { choiceWill, honorific, honorWords, neunde, promise, reactions } from './grade2/unit8-10';
import { handa, handaRules, inference, reportedOther, reportedStatement, seems } from './grade3/unit1-3';
import { assoonas, daga, eojida, geDoeda, giEum, neunGeot } from './grade3/unit4-6';
import { causative, deon, deoragoyo, hanja1, hanja2, passive, wongoji, writing53 } from './grade3/unit7-10';
import { evenIf, evenThough, suddenBusy, thanksBlame, whereas, yesBut } from './grade4/unit1-3';
import { ifOnly, supposeIf } from './grade4/unit4-6';
import type { ExamDef } from './exam';
import { prepExam } from './exams/prep';
import { topik1Exam } from './exams/topik1';
import { topik2Exam } from './exams/topik2';
import { topik3Exam } from './exams/topik3';
import type { Grade, Lesson } from './types';
import { withVocab } from './vocab';

const G0 = [vowelsBasic, vowelsY, consonantsBasic, consonantsTriples, syllableBlocks, batchim];
const G1 = [
  ...[iyeyo, eunneun, aniyeyo, igeot, isseoyo, ui, presentTense, eulreul, eeseo, sinoNumbers, prices],
  ...[nativeNumbers, telling, pastTense, weekend, negationAn, negationMot, future, want, seyo, lkkayo, formal, announcement],
];

const G2 = [tryIt, experience, canDo, mustDo, progressive, butIf, reo, plans, attrVerb, attrAdj, attrTense, when, beforeAfter, whileDoing, symptoms, because, reasonAseoNiga, permission, honorific, honorWords, promise, choiceWill, neunde, reactions];

const G3 = [handa, handaRules, reportedStatement, reportedOther, seems, inference, geDoeda, eojida, neunGeot, giEum, assoonas, daga, passive, causative, deoragoyo, deon, hanja1, hanja2, wongoji, writing53];

const G4 = [evenIf, evenThough, whereas, yesBut, suddenBusy, thanksBlame, ifOnly, supposeIf];

// Каждому уроку добавляется шаг «Новые слова» перед первым заданием на эти слова (см. vocab.ts).
export const LESSONS: Lesson[] = [...G0, ...G1, ...G2, ...G3, ...G4].map(withVocab);

/** Переводной экзамен каждого класса. */
export const EXAMS: Record<number, ExamDef> = { 0: prepExam, 1: topik1Exam, 2: topik2Exam, 3: topik3Exam };
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
      { grade: 1, n: 5, title: 'Время и исконные числа', titleKr: '시간', lessons: [nativeNumbers.id, telling.id] },
      { grade: 1, n: 6, title: 'Прошедшее время', titleKr: '과거', lessons: [pastTense.id, weekend.id] },
      { grade: 1, n: 7, title: 'Отрицание 안 / 못', titleKr: '부정', lessons: [negationAn.id, negationMot.id] },
      { grade: 1, n: 8, title: 'Планы и желания', titleKr: '계획', lessons: [future.id, want.id] },
      { grade: 1, n: 9, title: 'Просьбы и предложения', titleKr: '부탁', lessons: [seyo.id, lkkayo.id] },
      { grade: 1, n: 10, title: 'Официальный стиль 합니다', titleKr: '격식체', lessons: [formal.id, announcement.id] },
    ],
  },
  {
    n: 2,
    name: '2급',
    ru: 'Начальная школа · 2 класс',
    units: [
      { grade: 2, n: 1, title: 'Опыт', titleKr: '경험', lessons: [tryIt.id, experience.id] },
      { grade: 2, n: 2, title: 'Возможность и обязанность', titleKr: '능력과 의무', lessons: [canDo.id, mustDo.id] },
      { grade: 2, n: 3, title: 'Связки', titleKr: '연결', lessons: [progressive.id, butIf.id] },
      { grade: 2, n: 4, title: 'Цели и намерения', titleKr: '목적과 계획', lessons: [reo.id, plans.id] },
      { grade: 2, n: 5, title: 'Описание: определительные формы', titleKr: '묘사', lessons: [attrVerb.id, attrAdj.id, attrTense.id] },
      { grade: 2, n: 6, title: 'Время: когда, до, после', titleKr: '시간', lessons: [when.id, beforeAfter.id, whileDoing.id] },
      { grade: 2, n: 7, title: 'Здоровье и причины', titleKr: '건강', lessons: [symptoms.id, because.id, reasonAseoNiga.id, permission.id] },
      { grade: 2, n: 8, title: 'Почтительность', titleKr: '높임말', lessons: [honorific.id, honorWords.id] },
      { grade: 2, n: 9, title: 'Обещания и выбор', titleKr: '약속', lessons: [promise.id, choiceWill.id] },
      { grade: 2, n: 10, title: 'Живая речь', titleKr: '대화', lessons: [neunde.id, reactions.id] },
    ],
  },
  {
    n: 3,
    name: '3급',
    ru: 'Средняя школа · 1 класс · TOPIK II',
    units: [
      { grade: 3, n: 1, title: 'Письменный стиль', titleKr: '한다체', lessons: [handa.id, handaRules.id] },
      { grade: 3, n: 2, title: 'Косвенная речь', titleKr: '간접 화법', lessons: [reportedStatement.id, reportedOther.id] },
      { grade: 3, n: 3, title: 'Предположение', titleKr: '추측', lessons: [seems.id, inference.id] },
      { grade: 3, n: 4, title: 'Изменения: -게 되다, -아/어지다', titleKr: '변화', lessons: [geDoeda.id, eojida.id] },
      { grade: 3, n: 5, title: 'Номинализация: -기, -(으)ㅁ, -는 것', titleKr: '명사형', lessons: [neunGeot.id, giEum.id] },
      { grade: 3, n: 6, title: 'Время 2: -자마자, -다가', titleKr: '시간 2', lessons: [assoonas.id, daga.id] },
      { grade: 3, n: 7, title: 'Пассив и каузатив', titleKr: '피동과 사동', lessons: [passive.id, causative.id] },
      { grade: 3, n: 8, title: 'Воспоминание -더-', titleKr: '회상', lessons: [deoragoyo.id, deon.id] },
      { grade: 3, n: 9, title: 'Корни ханча', titleKr: '한자', lessons: [hanja1.id, hanja2.id] },
      { grade: 3, n: 10, title: 'Письмо TOPIK 51–53', titleKr: '쓰기', lessons: [wongoji.id, writing53.id] },
    ],
  },
  {
    n: 4,
    name: '4급',
    ru: 'Средняя школа · 2 класс · TOPIK II',
    units: [
      { grade: 4, n: 1, title: 'Уступка', titleKr: '양보', lessons: [evenIf.id, evenThough.id] },
      { grade: 4, n: 2, title: 'Противопоставление', titleKr: '대조', lessons: [whereas.id, yesBut.id] },
      { grade: 4, n: 3, title: 'Тонкие причины', titleKr: '원인', lessons: [suddenBusy.id, thanksBlame.id] },
      { grade: 4, n: 4, title: 'Гипотеза и сожаление', titleKr: '가정과 후회', lessons: [ifOnly.id, supposeIf.id] },
    ],
  },
  { n: 5, name: '5급', ru: 'Старшая школа · 1 класс', units: [] },
  { n: 6, name: '6급', ru: 'Старшая школа · 2 класс', units: [] },
];

/** Уроки класса в порядке программы. */
export function gradeLessons(grade: number): Lesson[] {
  const g = GRADES.find((x) => x.n === grade);
  return g ? g.units.flatMap((u) => u.lessons.map((id) => LESSON_BY_ID[id])) : [];
}

/** Урок старшего класса открывается как превью: прогресс не сохраняется. */
export function isPreviewLesson(l: Lesson, currentGrade: number): boolean {
  return l.grade > currentGrade;
}
