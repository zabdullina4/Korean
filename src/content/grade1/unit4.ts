import { numberItem, priceListenItem, priceReadItem } from '../gen';
import type { Lesson } from '../types';

export const sinoNumbers: Lesson = {
  id: 'g1-u4-l1',
  grade: 1,
  unit: 4,
  title: 'Сино-корейские числа: 일, 이, 삼…',
  short: 'Числа 일 이 삼',
  minutes: 14,
  skill: 'listen',
  words: [
    { id: 'w-beonho', kr: '번호', ru: 'номер' },
    { id: 'w-jeonhwa', kr: '전화', ru: 'телефон, звонок' },
    { id: 'w-gong', kr: '공', ru: 'ноль (в номерах)' },
  ],
  steps: [
    {
      kind: 'letters',
      title: 'От 1 до 10',
      sub: 'Нажмите на каждую цифру.',
      letters: [
        { char: '1', say: '일', name: '일', hint: '일' },
        { char: '2', say: '이', name: '이', hint: '이' },
        { char: '3', say: '삼', name: '삼', hint: '삼' },
        { char: '4', say: '사', name: '사', hint: '사' },
        { char: '5', say: '오', name: '오', hint: '오' },
        { char: '6', say: '육', name: '육', hint: '육 — в середине числа часто [뉵] или [륙]' },
        { char: '7', say: '칠', name: '칠', hint: '칠' },
        { char: '8', say: '팔', name: '팔', hint: '팔' },
        { char: '9', say: '구', name: '구', hint: '구' },
        { char: '10', say: '십', name: '십', hint: '십' },
      ],
      note: 'В корейском две системы чисел. Сино-корейская — для денег, дат, минут, номеров. Исконная (하나, 둘…) — для счёта предметов и часов, о ней позже.',
    },
    {
      kind: 'board',
      title: 'Числа строятся как сложение',
      sub: 'Как в китайском: «два-десять-три» = 23.',
      lines: [
        '11 = 십일 · 20 = [[a|이]]십 · 23 = [[a|이]]십[[b|삼]]',
        '100 = 백 · 1000 = 천 · 10 000 = [[yes|만]]',
        'Перед 십, 백, 천, 만 единица не произносится: 백, а не 일백',
        'Телефон — по цифрам, ноль = [[a|공]]: 010 → 공일공',
      ],
      note: 'Корейцы считают крупные числа по 만 (10 000), а не по тысячам: 50 000 = 오만, «пять десятитысяч».',
    },
    {
      kind: 'choice',
      title: 'Прочитайте число',
      items: [numberItem(11), numberItem(27), numberItem(46), numberItem(90), numberItem(38)],
    },
    {
      kind: 'choice',
      title: 'Номер телефона',
      items: [
        { prompt: '010-1234-5678', options: ['공일공에 일이삼사에 오육칠팔', '영일영에 일이삼사에 오육칠팔', '공일공에 하나둘셋넷에 오육칠팔'], answer: 0, why: 'Ноль в номерах — [[kr|공]], цифры сино-корейские. Дефис читается [에].', errorType: 'vocab' },
        { prompt: '전화번호', options: ['номер телефона', 'телефонная трубка', 'номер дома'], answer: 0, why: '[[kr|전화]] «телефон» + [[kr|번호]] «номер».', errorType: 'vocab' },
      ],
    },
  ],
};

export const prices: Lesson = {
  id: 'g1-u4-l2',
  grade: 1,
  unit: 4,
  title: 'Сколько стоит? Цены в вонах',
  short: 'Цены · 얼마예요?',
  minutes: 15,
  skill: 'listen',
  words: [
    { id: 'w-eolma', kr: '얼마', ru: 'сколько (о цене)' },
    { id: 'w-juseyo', kr: '주세요', ru: 'дайте, пожалуйста' },
    { id: 'w-won', kr: '원', ru: 'вона' },
    { id: 'w-bissada', kr: '비싸다', ru: 'дорогой' },
    { id: 'w-ssada', kr: '싸다', ru: 'дешёвый' },
  ],
  steps: [
    {
      kind: 'dialogue',
      title: 'В 편의점',
      sub: 'Магазин у дома. Нажмите на реплики.',
      lines: [
        { who: '안나', kr: '이거 얼마예요?', ru: 'Сколько это стоит?', me: true },
        { who: '직원', kr: '삼천오백 원이에요.', ru: '3 500 вон.' },
        { who: '안나', kr: '이거 주세요.', ru: 'Дайте, пожалуйста, это.', me: true },
        { who: '직원', kr: '네, 감사합니다.', ru: 'Да, спасибо.' },
      ],
    },
    {
      kind: 'board',
      title: 'Читаем цены',
      sub: 'Цена = сино-корейское число + 원.',
      lines: [
        '3,500원 = [[a|삼천오백]] 원',
        '15,000원 = [[b|만]] [[a|오천]] 원 (пробел после 만)',
        '24,500원 = [[b|이만]] [[a|사천오백]] 원',
        'Покупка: N + [[yes|주세요]] — «дайте N»',
      ],
    },
    {
      kind: 'choice',
      title: 'Как прочитать цену',
      items: [priceReadItem(3500), priceReadItem(15000), priceReadItem(1200), priceReadItem(8000), priceReadItem(24500)],
    },
    {
      kind: 'choice',
      title: 'Цена на слух',
      sub: 'Нажмите ▶ и выберите сумму.',
      items: [priceListenItem(4500), priceListenItem(12000), priceListenItem(700), priceListenItem(30000)],
    },
    {
      kind: 'build',
      title: 'Купите',
      ru: 'Дайте, пожалуйста, кофе.',
      target: ['커피', '주세요'],
      pool: ['주세요', '커피', '얼마예요', '있어요'],
      hints: [
        { ifIncludes: '얼마예요', why: '[[kr|얼마예요]] — «сколько стоит?». Попросить — [[kr|주세요]].' },
        { ifIncludes: '있어요', why: '[[kr|있어요]] — «есть». Попросить — [[kr|주세요]].' },
      ],
      errorType: 'vocab',
    },
  ],
  outro: 'Юнит «Числа» пройден. Следующие юниты 1급 — время и исконные числа, прошедшее время, отрицание — готовятся.',
};
