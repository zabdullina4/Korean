// Выпускной экзамен 예비반: 듣기 (различение звуков), 읽기 (правила чтения и слова), 쓰기 (диктант).
// Каждая попытка — новый вариант: задания выбираются из банков, звучащее слово и порядок ответов случайны.
import { rng, sample, shuffle } from '../../lib/random';
import { shuffleOptions, type ExamDef, type ExamSection, type SpellItem } from '../exam';
import type { ChoiceItem } from '../types';

/** Наборы минимальных пар: звучит одно слово из набора. */
const LISTEN_SETS: { opts: string[]; gloss?: Record<string, string>; rule: string }[] = [
  { opts: ['달', '탈', '딸'], gloss: { 달: 'луна', 탈: 'маска', 딸: 'дочь' }, rule: 'слабый / придыхательный / напряжённый' },
  { opts: ['불', '풀', '뿔'], gloss: { 불: 'огонь', 풀: 'трава', 뿔: 'рог' }, rule: 'ㅂ / ㅍ / ㅃ' },
  { opts: ['자다', '차다', '짜다'], gloss: { 자다: 'спать', 차다: 'холодный; пинать', 짜다: 'солёный' }, rule: 'ㅈ / ㅊ / ㅉ' },
  { opts: ['방', '빵'], gloss: { 방: 'комната', 빵: 'хлеб' }, rule: 'ㅂ / ㅃ' },
  { opts: ['공', '콩'], gloss: { 공: 'мяч', 콩: 'фасоль' }, rule: 'ㄱ / ㅋ' },
  { opts: ['굴', '꿀'], gloss: { 굴: 'устрица', 꿀: 'мёд' }, rule: 'ㄱ / ㄲ' },
  { opts: ['살', '쌀'], gloss: { 살: 'плоть; лет (возраст)', 쌀: 'рис (зерно)' }, rule: 'ㅅ / ㅆ' },
  { opts: ['사다', '싸다'], gloss: { 사다: 'покупать', 싸다: 'дешёвый' }, rule: 'ㅅ / ㅆ' },
  { opts: ['비', '피'], gloss: { 비: 'дождь', 피: 'кровь' }, rule: 'ㅂ / ㅍ' },
  { opts: ['다리', '따리'], rule: 'ㄷ / ㄸ' },
  { opts: ['거', '고'], rule: 'ㅓ / ㅗ' },
  { opts: ['어리다', '오리다'], rule: 'ㅓ / ㅗ' },
  { opts: ['으', '우'], rule: 'ㅡ / ㅜ' },
  { opts: ['이사', '의사'], gloss: { 이사: 'переезд', 의사: 'врач' }, rule: 'ㅣ / ㅢ' },
  { opts: ['여우', '요우'], rule: 'ㅕ / ㅛ' },
  { opts: ['가요', '까요', '카요'], rule: 'ㄱ / ㄲ / ㅋ' },
];

/** Правила чтения: как произносится написанное. */
const READ_PRON: ChoiceItem[] = [
  { prompt: '꽃', options: ['[꼳]', '[꼿]', '[꼬]'], answer: 0, why: 'ㅊ в патчиме → [ㄷ].', errorType: 'pronunciation' },
  { prompt: '앞', options: ['[압]', '[앞]', '[아프]'], answer: 0, why: 'ㅍ в патчиме → [ㅂ].', errorType: 'pronunciation' },
  { prompt: '부엌', options: ['[부억]', '[부엌]', '[부어]'], answer: 0, why: 'ㅋ в патчиме → [ㄱ].', errorType: 'pronunciation' },
  { prompt: '밖', options: ['[박]', '[밖]', '[바]'], answer: 0, why: 'ㄲ в патчиме → [ㄱ].', errorType: 'pronunciation' },
  { prompt: '낮', options: ['[낟]', '[낮]', '[나]'], answer: 0, why: 'ㅈ в патчиме → [ㄷ].', errorType: 'pronunciation' },
  { prompt: '옷이', options: ['[오시]', '[옫이]', '[오디]'], answer: 0, why: 'Перед гласной патчим переходит в следующий слог: [오시].', errorType: 'pronunciation' },
  { prompt: '음악', options: ['[으막]', '[음악]', '[음막]'], answer: 0, why: 'Перенос патчима: 음악 → [으막].', errorType: 'pronunciation' },
  { prompt: '한국어', options: ['[한구거]', '[한국어]', '[하눅어]'], answer: 0, why: 'ㄱ переходит к 어: [한구거].', errorType: 'pronunciation' },
  { prompt: '꽃이', options: ['[꼬치]', '[꼳이]', '[꼬디]'], answer: 0, why: 'Перед гласной ㅊ звучит полностью: [꼬치].', errorType: 'pronunciation' },
  { prompt: '있어요', options: ['[이써요]', '[읻어요]', '[이서요]'], answer: 0, why: 'ㅆ переходит к 어 и остаётся напряжённым: [이써요].', errorType: 'pronunciation' },
  { prompt: '밥', options: ['[밥]', '[바브]', '[받]'], answer: 0, why: 'ㅂ — один из семи звучащих патчимов.', errorType: 'pronunciation' },
  { prompt: '책이', options: ['[채기]', '[책이]', '[채치]'], answer: 0, why: 'Перенос патчима: [채기].', errorType: 'pronunciation' },
];

/** Слова 0급: выбрать перевод. */
const READ_WORDS: [string, string, string[]][] = [
  ['아이', 'ребёнок', ['огурец', 'молоко']],
  ['우유', 'молоко', ['лиса', 'причина']],
  ['나무', 'дерево', ['море', 'шапка']],
  ['바다', 'море', ['дерево', 'мать']],
  ['커피', 'кофе', ['чай', 'папа']],
  ['사과', 'яблоко', ['свинья', 'врач']],
  ['의사', 'врач', ['компания', 'переезд']],
  ['한국어', 'корейский язык', ['Корея', 'книга']],
  ['물', 'вода', ['рис', 'одежда']],
  ['책', 'книга', ['цветок', 'вода']],
  ['어머니', 'мать', ['папа', 'ребёнок']],
  ['회사', 'компания', ['врач', 'яблоко']],
];

const SPELL: SpellItem[] = [
  { audio: '바다', ru: 'море', target: ['바', '다'], pool: ['바', '다', '파', '타'], alts: ['바타', '파다'] },
  { audio: '커피', ru: 'кофе', target: ['커', '피'], pool: ['커', '피', '거', '비', '코'], alts: ['거피', '커비'] },
  { audio: '우유', ru: 'молоко', target: ['우', '유'], pool: ['우', '유', '오', '요'], alts: ['우요', '오유'] },
  { audio: '사과', ru: 'яблоко', target: ['사', '과'], pool: ['사', '과', '싸', '궈'], alts: ['싸과', '사궈'] },
  { audio: '의사', ru: 'врач', target: ['의', '사'], pool: ['의', '사', '이', '싸'], alts: ['이사', '의싸'] },
  { audio: '한국', ru: 'Корея', target: ['한', '국'], pool: ['한', '국', '항', '궁', '굳'], alts: ['한굳', '항국'] },
  { audio: '아빠', ru: 'папа', target: ['아', '빠'], pool: ['아', '빠', '바', '파'], alts: ['아바', '아파'] },
  { audio: '옷', ru: 'одежда', target: ['옷'], pool: ['옷', '옫', '옺'], alts: ['옫', '옺'] },
  { audio: '꽃', ru: 'цветок', target: ['꽃'], pool: ['꽃', '꼳', '꼿'], alts: ['꼳', '꼿'] },
  { audio: '나무', ru: 'дерево', target: ['나', '무'], pool: ['나', '무', '너', '모'], alts: ['너무', '나모'] },
  { audio: '토마토', ru: 'помидор', target: ['토', '마', '토'], pool: ['토', '마', '도', '머'], alts: ['도마토', '토머토'] },
  { audio: '딸', ru: 'дочь', target: ['딸'], pool: ['딸', '달', '탈'], alts: ['달', '탈'] },
];

export const prepExam: ExamDef = {
  id: 'exam-g0',
  grade: 0,
  title: 'Выпускной экзамен подготовительного класса',
  titleKr: '예비반 졸업 시험',
  minutes: 20,
  pass: 0.8,
  plays: 2,
  make(seed: number): ExamSection[] {
    const r = rng(seed);
    const listen = sample(LISTEN_SETS, 10, r).map((set) => {
      const audio = set.opts[Math.floor(r() * set.opts.length)];
      const options = shuffle(set.opts, r);
      const g = set.gloss?.[audio];
      return {
        kind: 'choice' as const,
        item: {
          prompt: '___',
          audio,
          options,
          answer: options.indexOf(audio),
          why: `Звучало [[kr|${audio}]]${g ? ` — ${g}` : ''}. Пара: ${set.rule}.`,
          errorType: 'pronunciation' as const,
        },
      };
    });
    const read = [
      ...sample(READ_PRON, 5, r).map((it) => ({ kind: 'choice' as const, item: shuffleOptions({ ...it, ru: 'Как это читается?' }, r) })),
      ...sample(READ_WORDS, 5, r).map(([kr, ru, wrong]) => ({
        kind: 'choice' as const,
        item: shuffleOptions({ prompt: kr, options: [ru, ...wrong], answer: 0, why: `[[kr|${kr}]] — ${ru}.`, errorType: 'vocab' as const }, r),
      })),
    ];
    const write = sample(SPELL, 5, r).map((it) => ({ kind: 'spell' as const, item: { ...it, pool: shuffle(it.pool, r) } }));
    return [
      { key: 'listen', kr: '듣기', ru: 'Аудирование', questions: listen },
      { key: 'read', kr: '읽기', ru: 'Чтение', questions: shuffle(read, r) },
      { key: 'write', kr: '쓰기', ru: 'Диктант', questions: write },
    ];
  },
};
