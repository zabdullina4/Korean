import { hash, rng, shuffle } from '../lib/random';
import { consonantsBasic, consonantsTriples } from './grade0/consonants';
import { batchim, syllableBlocks } from './grade0/syllables';
import { vowelsBasic, vowelsY } from './grade0/vowels';
import { aniyeyo, eunneun, iyeyo } from './grade1/unit1';
import { igeot, isseoyo, ui } from './grade1/unit2';
import { eeseo, eulreul, presentTense } from './grade1/unit3';
import { prices, sinoNumbers } from './grade1/unit4';
import { nativeNumbers, negationAn, negationMot, pastTense, telling, weekend } from './grade1/unit5-7';
import { announcement, formal, future, lkkayo, seyo, want } from './grade1/unit8-10';
import { andGo, particlesAlso, particlesTo, pleaseDo } from './grade1/extra';
import { compare, irregulars, knowHow, looks, sequence, sinceNow, suggestGunyo, wishes } from './grade2/extra';
import { reasonAseoNiga } from './grade2/reason';
import { asSoonHabit, completion, insteadWhile, maybeFear, reportedShort, stateReady, tendency } from './grade3/extra';
import { asMuchAs, evenAny, justAbout, notOnly, reasons3, shouldHave, talkEndings } from './grade4/extra';
import { butIf, canDo, experience, mustDo, plans, progressive, reo, tryIt } from './grade2/unit1-4';
import { attrAdj, attrTense, attrVerb } from './grade2/unit5';
import { beforeAfter, when, whileDoing } from './grade2/unit6';
import { because, permission, symptoms } from './grade2/unit7';
import { choiceWill, honorific, honorWords, neunde, promise, reactions } from './grade2/unit8-10';
import { handa, handaRules, inference, reportedOther, reportedStatement, seems } from './grade3/unit1-3';
import { assoonas, daga, eojida, geDoeda, giEum, neunGeot } from './grade3/unit4-6';
import { causative, deon, deoragoyo, hanja1, hanja2, passive, wongoji, writing53 } from './grade3/unit7-10';
import { evenIf, evenThough, suddenBusy, thanksBlame, whereas, yesBut } from './grade4/unit1-3';
import { deoniAtdeoni, dorokGoja, geodeunJana, gyeom, ifOnly, supposeIf, tendeGeonde } from './grade4/unit4-6';
import { degree, essay54, essayPlan, gimanHamyeon, hanjaCulture, hanjaSociety, idioms, proverbs } from './grade4/unit7-10';
import { accordingTo, aslongas, bookReason, byMeans, likely, naturally, ratherThan, whetherOr } from './grade5/unit1-4';
import { amountsTo, asIf, asYouKnow, dependsOn, evenParticles, letAlone } from './grade5/unit5-7';
import { geoniwa, doda, haoche, hageche, ljindae, luckily, namana, nora } from './grade6/unit1-4';
import { academic, despite, edaga, raya, synChange, synThink } from './grade6/unit5-7';
import { essay6, essayStyle, hanja4, idioms4, poetry, prose } from './grade6/unit8-10';
import { essayArgument, hanja3, idioms2, idioms3, idiomsBody, idiomsHead, pressStyles } from './grade5/unit8-10';
import type { ExamDef } from './exam';
import { prepExam } from './exams/prep';
import { topik1Exam } from './exams/topik1';
import { topik2Exam } from './exams/topik2';
import { topik3Exam } from './exams/topik3';
import { topik4Exam } from './exams/topik4';
import { topik6Exam } from './exams/topik6';
import { topik5Exam } from './exams/topik5';
import type { Grade, Lesson } from './types';
import { withVocab } from './vocab';

const G0 = [vowelsBasic, vowelsY, consonantsBasic, consonantsTriples, syllableBlocks, batchim];
const G1 = [
  ...[iyeyo, eunneun, aniyeyo, igeot, isseoyo, ui, presentTense, eulreul, eeseo, sinoNumbers, prices],
  ...[nativeNumbers, telling, pastTense, weekend, negationAn, negationMot, future, want, seyo, lkkayo, formal, announcement],
  ...[particlesAlso, particlesTo, andGo, pleaseDo],
];

const G2 = [
  ...[tryIt, experience, canDo, mustDo, progressive, butIf, reo, plans, attrVerb, attrAdj, attrTense, when, beforeAfter, whileDoing, symptoms, because, reasonAseoNiga, permission, honorific, honorWords, promise, choiceWill, neunde, reactions],
  ...[knowHow, sequence, compare, wishes, looks, irregulars, sinceNow, suggestGunyo],
];

const G3 = [
  ...[handa, handaRules, reportedStatement, reportedOther, seems, inference, geDoeda, eojida, neunGeot, giEum, assoonas, daga, passive, causative, deoragoyo, deon, hanja1, hanja2, wongoji, writing53],
  ...[reportedShort, maybeFear, tendency, stateReady, completion, asSoonHabit, insteadWhile],
];

const G4 = [
  ...[evenIf, evenThough, whereas, yesBut, suddenBusy, thanksBlame, ifOnly, supposeIf, geodeunJana, tendeGeonde, deoniAtdeoni],
  ...[dorokGoja, gyeom, degree, gimanHamyeon, idioms, proverbs, hanjaSociety, hanjaCulture, essayPlan, essay54],
  ...[evenAny, notOnly, reasons3, shouldHave, talkEndings, justAbout, asMuchAs],
];

const G5 = [
  ...[naturally, likely, accordingTo, aslongas, bookReason, byMeans, ratherThan, whetherOr, letAlone, evenParticles],
  ...[amountsTo, dependsOn, asYouKnow, asIf, idiomsHead, idiomsBody, idioms2, idioms3, hanja3, pressStyles, essayArgument],
];

const G6 = [
  ...[namana, luckily, geoniwa, ljindae, nora, doda, haoche, hageche, edaga, raya],
  ...[synChange, synThink, despite, academic, poetry, prose, idioms4, hanja4, essayStyle, essay6],
];

/**
 * В рукописных заданиях автор обычно ставит верный вариант первым; плеер показывает варианты как есть.
 * Поэтому порядок перемешивается здесь — детерминированно по тексту задания, чтобы он не менялся между запусками.
 */
export function shuffleOptions(l: Lesson): Lesson {
  const steps = l.steps.map((s) =>
    s.kind !== 'choice'
      ? s
      : {
          ...s,
          items: s.items.map((it) => {
            const options = shuffle(it.options, rng(hash(`${l.id}|${it.prompt}|${it.options.join('|')}`)));
            return { ...it, options, answer: options.indexOf(it.options[it.answer]) };
          }),
        },
  );
  return { ...l, steps };
}

// Каждому уроку добавляется шаг «Новые слова» перед первым заданием на эти слова (см. vocab.ts).
export const LESSONS: Lesson[] = [...G0, ...G1, ...G2, ...G3, ...G4, ...G5, ...G6].map(withVocab).map(shuffleOptions);

/** Переводной экзамен каждого класса. */
export const EXAMS: Record<number, ExamDef> = { 0: prepExam, 1: topik1Exam, 2: topik2Exam, 3: topik3Exam, 4: topik4Exam, 5: topik5Exam, 6: topik6Exam };
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
      { grade: 1, n: 2, title: 'Вещи и семья', titleKr: '물건과 가족', lessons: [igeot.id, isseoyo.id, ui.id, particlesAlso.id] },
      { grade: 1, n: 3, title: 'Мой день', titleKr: '하루', lessons: [presentTense.id, eulreul.id, eeseo.id, particlesTo.id] },
      { grade: 1, n: 4, title: 'Числа и цены', titleKr: '숫자와 가격', lessons: [sinoNumbers.id, prices.id] },
      { grade: 1, n: 5, title: 'Время и исконные числа', titleKr: '시간', lessons: [nativeNumbers.id, telling.id] },
      { grade: 1, n: 6, title: 'Прошедшее время', titleKr: '과거', lessons: [pastTense.id, weekend.id, andGo.id] },
      { grade: 1, n: 7, title: 'Отрицание 안 / 못', titleKr: '부정', lessons: [negationAn.id, negationMot.id] },
      { grade: 1, n: 8, title: 'Планы и желания', titleKr: '계획', lessons: [future.id, want.id] },
      { grade: 1, n: 9, title: 'Просьбы и предложения', titleKr: '부탁', lessons: [seyo.id, lkkayo.id, pleaseDo.id] },
      { grade: 1, n: 10, title: 'Официальный стиль 합니다', titleKr: '격식체', lessons: [formal.id, announcement.id] },
    ],
  },
  {
    n: 2,
    name: '2급',
    ru: 'Начальная школа · 2 класс',
    units: [
      { grade: 2, n: 1, title: 'Опыт', titleKr: '경험', lessons: [tryIt.id, experience.id] },
      { grade: 2, n: 2, title: 'Возможность и обязанность', titleKr: '능력과 의무', lessons: [canDo.id, mustDo.id, knowHow.id] },
      { grade: 2, n: 3, title: 'Связки', titleKr: '연결', lessons: [progressive.id, butIf.id, sequence.id, compare.id] },
      { grade: 2, n: 4, title: 'Цели и намерения', titleKr: '목적과 계획', lessons: [reo.id, plans.id, wishes.id] },
      { grade: 2, n: 5, title: 'Описание: определительные формы', titleKr: '묘사', lessons: [attrVerb.id, attrAdj.id, attrTense.id, looks.id, irregulars.id] },
      { grade: 2, n: 6, title: 'Время: когда, до, после', titleKr: '시간', lessons: [when.id, beforeAfter.id, whileDoing.id, sinceNow.id] },
      { grade: 2, n: 7, title: 'Здоровье и причины', titleKr: '건강', lessons: [symptoms.id, because.id, reasonAseoNiga.id, permission.id] },
      { grade: 2, n: 8, title: 'Почтительность', titleKr: '높임말', lessons: [honorific.id, honorWords.id] },
      { grade: 2, n: 9, title: 'Обещания и выбор', titleKr: '약속', lessons: [promise.id, choiceWill.id] },
      { grade: 2, n: 10, title: 'Живая речь', titleKr: '대화', lessons: [neunde.id, reactions.id, suggestGunyo.id] },
    ],
  },
  {
    n: 3,
    name: '3급',
    ru: 'Средняя школа · 1 класс · TOPIK II',
    units: [
      { grade: 3, n: 1, title: 'Письменный стиль', titleKr: '한다체', lessons: [handa.id, handaRules.id] },
      { grade: 3, n: 2, title: 'Косвенная речь', titleKr: '간접 화법', lessons: [reportedStatement.id, reportedOther.id, reportedShort.id] },
      { grade: 3, n: 3, title: 'Предположение', titleKr: '추측', lessons: [seems.id, inference.id, maybeFear.id, tendency.id] },
      { grade: 3, n: 4, title: 'Изменения: -게 되다, -아/어지다', titleKr: '변화', lessons: [geDoeda.id, eojida.id, stateReady.id, completion.id] },
      { grade: 3, n: 5, title: 'Номинализация: -기, -(으)ㅁ, -는 것', titleKr: '명사형', lessons: [neunGeot.id, giEum.id] },
      { grade: 3, n: 6, title: 'Время 2: -자마자, -다가', titleKr: '시간 2', lessons: [assoonas.id, daga.id, asSoonHabit.id, insteadWhile.id] },
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
      { grade: 4, n: 1, title: 'Уступка', titleKr: '양보', lessons: [evenIf.id, evenThough.id, evenAny.id] },
      { grade: 4, n: 2, title: 'Противопоставление', titleKr: '대조', lessons: [whereas.id, yesBut.id, notOnly.id] },
      { grade: 4, n: 3, title: 'Тонкие причины', titleKr: '원인', lessons: [suddenBusy.id, thanksBlame.id, reasons3.id] },
      { grade: 4, n: 4, title: 'Гипотеза и сожаление', titleKr: '가정과 후회', lessons: [ifOnly.id, supposeIf.id, shouldHave.id] },
      { grade: 4, n: 5, title: 'Похожие конструкции', titleKr: '비슷한 표현', lessons: [geodeunJana.id, tendeGeonde.id, deoniAtdeoni.id, talkEndings.id] },
      { grade: 4, n: 6, title: 'Цель 2', titleKr: '목적', lessons: [dorokGoja.id, gyeom.id, justAbout.id] },
      { grade: 4, n: 7, title: 'Степень и мера', titleKr: '정도', lessons: [degree.id, gimanHamyeon.id, asMuchAs.id] },
      { grade: 4, n: 8, title: 'Идиомы и пословицы', titleKr: '사자성어와 속담', lessons: [idioms.id, proverbs.id] },
      { grade: 4, n: 9, title: 'Корни ханча 2', titleKr: '한자 2', lessons: [hanjaSociety.id, hanjaCulture.id] },
      { grade: 4, n: 10, title: 'Эссе TOPIK 54', titleKr: '쓰기 54', lessons: [essayPlan.id, essay54.id] },
    ],
  },
  {
    n: 5,
    name: '5급',
    ru: 'Старшая школа · 1 класс · TOPIK II',
    units: [
      { grade: 5, n: 1, title: 'Закономерность', titleKr: '당연과 불가피', lessons: [naturally.id, likely.id] },
      { grade: 5, n: 2, title: 'Зависимость и условие', titleKr: '조건', lessons: [accordingTo.id, aslongas.id] },
      { grade: 5, n: 3, title: 'Книжные причины', titleKr: '원인과 수단', lessons: [bookReason.id, byMeans.id] },
      { grade: 5, n: 4, title: 'Выбор', titleKr: '선택', lessons: [ratherThan.id, whetherOr.id] },
      { grade: 5, n: 5, title: '«Даже» и «тем более»', titleKr: '강조', lessons: [letAlone.id, evenParticles.id] },
      { grade: 5, n: 6, title: 'Оценка и итог', titleKr: '평가', lessons: [amountsTo.id, dependsOn.id] },
      { grade: 5, n: 7, title: 'Ссылки и сравнения', titleKr: '인용과 비유', lessons: [asYouKnow.id, asIf.id] },
      { grade: 5, n: 8, title: 'Идиомы 관용어', titleKr: '관용어', lessons: [idiomsHead.id, idiomsBody.id] },
      { grade: 5, n: 9, title: '사자성어 и ханча 3', titleKr: '사자성어·한자 3', lessons: [idioms2.id, idioms3.id, hanja3.id] },
      { grade: 5, n: 10, title: 'Стиль и эссе', titleKr: '문체와 쓰기', lessons: [pressStyles.id, essayArgument.id] },
    ],
  },
  {
    n: 6,
    name: '6급',
    ru: 'Старшая школа · 2 класс · TOPIK II',
    units: [
      { grade: 6, n: 1, title: '«Бесполезно» и «хорошо ещё, что»', titleKr: '헛됨과 다행', lessons: [namana.id, luckily.id] },
      { grade: 6, n: 2, title: 'Книжные связки', titleKr: '문어 연결', lessons: [geoniwa.id, ljindae.id] },
      { grade: 6, n: 3, title: 'Литературные окончания', titleKr: '문학 어미', lessons: [nora.id, doda.id] },
      { grade: 6, n: 4, title: '하오체 и 하게체', titleKr: '하오체·하게체', lessons: [haoche.id, hageche.id] },
      { grade: 6, n: 5, title: 'Частицы 6급', titleKr: '조사', lessons: [edaga.id, raya.id] },
      { grade: 6, n: 6, title: 'Тонкие синонимы', titleKr: '유의어', lessons: [synChange.id, synThink.id] },
      { grade: 6, n: 7, title: 'Академический стиль', titleKr: '학술 문체', lessons: [despite.id, academic.id] },
      { grade: 6, n: 8, title: 'Литература', titleKr: '문학', lessons: [poetry.id, prose.id] },
      { grade: 6, n: 9, title: '사자성어 и ханча 4', titleKr: '사자성어·한자 4', lessons: [idioms4.id, hanja4.id] },
      { grade: 6, n: 10, title: 'Эссе на высокий балл', titleKr: '고급 쓰기', lessons: [essayStyle.id, essay6.id] },
    ],
  },
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
