import { haeyoItem } from '../gen';
import type { Lesson } from '../types';

export const presentTense: Lesson = {
  id: 'g1-u3-l1',
  grade: 1,
  unit: 3,
  title: 'Настоящее время: -아요 / -어요 / 해요',
  short: 'Глаголы -아/어요',
  minutes: 16,
  skill: 'core',
  words: [
    { id: 'w-gada', kr: '가다', ru: 'идти, ехать' },
    { id: 'w-oda', kr: '오다', ru: 'приходить' },
    { id: 'w-meokda', kr: '먹다', ru: 'есть (кушать)', pron: '[먹따]' },
    { id: 'w-masida', kr: '마시다', ru: 'пить' },
    { id: 'w-boda', kr: '보다', ru: 'смотреть' },
    { id: 'w-baeuda', kr: '배우다', ru: 'учить, изучать' },
    { id: 'w-gongbuhada', kr: '공부하다', ru: 'учиться, заниматься' },
  ],
  steps: [
    {
      kind: 'board',
      title: 'Гармония гласных',
      sub: 'Словарная форма оканчивается на 다. Отбрасываем 다 и смотрим на последний слог основы.',
      lines: [
        'Гласная [[a|ㅏ]] или [[a|ㅗ]] → [[a|-아요]]: 살다 → 살아요, 앉다 → 앉아요',
        'Любая другая → [[b|-어요]]: 먹다 → 먹어요, 읽다 → 읽어요',
        '하다 → [[yes|해요]]: 공부하다 → 공부해요',
        'Без патчима гласные сливаются:',
        '가 + 아요 → 가요 · 오 + 아요 → [[a|와요]] · 보 + 아요 → [[a|봐요]]',
        '마시 + 어요 → [[b|마셔요]] · 배우 + 어요 → [[b|배워요]]',
      ],
      note: 'Одна и та же форма — и утверждение, и вопрос, и даже мягкое предложение: 가요? «Идём?»',
    },
    {
      kind: 'choice',
      title: 'Спрягайте',
      sub: 'Выберите форму в стиле 해요.',
      items: [
        haeyoItem('먹다', 'есть'),
        haeyoItem('가다', 'идти'),
        haeyoItem('오다', 'приходить'),
        haeyoItem('공부하다', 'учиться'),
        haeyoItem('마시다', 'пить'),
        haeyoItem('배우다', 'изучать'),
        haeyoItem('읽다', 'читать'),
        haeyoItem('앉다', 'сидеть'),
      ],
    },
    {
      kind: 'dialogue',
      title: 'Что вы делаете?',
      lines: [
        { who: '민준', kr: '안나 씨, 뭐 해요?', ru: 'Анна, что делаешь?' },
        { who: '안나', kr: '한국어를 공부해요.', ru: 'Учу корейский.', me: true },
        { who: '민준', kr: '저는 커피를 마셔요.', ru: 'А я пью кофе.' },
      ],
      note: '뭐 해요? — самый частый вопрос корейского: «Чем занят?»',
    },
    {
      kind: 'choice',
      title: 'Ещё глаголы',
      items: [haeyoItem('보다', 'смотреть'), haeyoItem('자다', 'спать'), haeyoItem('일하다', 'работать'), haeyoItem('기다리다', 'ждать')],
    },
  ],
};

export const eulreul: Lesson = {
  id: 'g1-u3-l2',
  grade: 1,
  unit: 3,
  title: 'Объект действия: 을 / 를',
  short: 'Объект 을/를',
  minutes: 12,
  skill: 'core',
  words: [
    { id: 'w-yeonghwa', kr: '영화', ru: 'фильм' },
    { id: 'w-eumak', kr: '음악', ru: 'музыка', pron: '[으막]' },
    { id: 'w-ppang', kr: '빵', ru: 'хлеб' },
    { id: 'w-sseuda', kr: '쓰다', ru: 'писать' },
  ],
  steps: [
    {
      kind: 'board',
      title: 'Винительный падеж по-корейски',
      sub: 'Объект действия отмечается частицей, а глагол уходит в конец: «Я кофе пью».',
      lines: [
        'После патчима — [[b|을]]: 밥[[b|을]] 먹어요, 빵[[b|을]] 먹어요',
        'После гласной — [[a|를]]: 커피[[a|를]] 마셔요, 영화[[a|를]] 봐요',
        'Порядок: подлежащее → объект → [[yes|глагол]]',
        '저는 한국어를 [[yes|배워요]].',
      ],
      note: 'В разговоре 을/를 часто опускают: 커피 마셔요. На письме и в экзаменах — ставьте.',
    },
    {
      kind: 'choice',
      title: 'Частица объекта',
      items: [
        { prompt: '빵___ 먹어요.', options: ['을', '를'], answer: 0, why: '빵 — патчим → [[kr|을]].', errorType: 'particle' },
        { prompt: '영화___ 봐요.', options: ['을', '를'], answer: 1, why: '영화 — на гласную → [[kr|를]].', errorType: 'particle' },
        { prompt: '음악___ 들어요.', ru: 'Слушаю музыку.', options: ['을', '를'], answer: 0, why: '악 — патчим → [[kr|을]].', errorType: 'particle' },
        { prompt: '한국어___ 배워요.', options: ['을', '를'], answer: 1, why: '어 — на гласную → [[kr|를]].', errorType: 'particle' },
        { prompt: '커피___ 마셔요.', options: ['이', '를', '은'], answer: 1, why: 'Кофе — объект действия → [[kr|를]].', errorType: 'particle' },
      ],
    },
    {
      kind: 'build',
      title: 'Соберите',
      ru: 'Я пью кофе.',
      target: ['저는', '커피를', '마셔요'],
      pool: ['마셔요', '커피를', '저는', '커피가', '마시어요'],
      hints: [
        { ifIncludes: '커피가', why: 'Кофе — объект, нужна [[kr|를]].' },
        { ifIncludes: '마시어요', why: '마시 + 어요 сливается в [[kr|마셔요]].' },
      ],
      errorType: 'particle',
    },
    {
      kind: 'build',
      title: 'Ещё одно',
      ru: 'Минджун смотрит фильм.',
      target: ['민준', '씨는', '영화를', '봐요'],
      pool: ['봐요', '영화를', '씨는', '민준', '영화을', '보아요'],
      hints: [
        { ifIncludes: '영화을', why: '영화 — на гласную → [[kr|를]].' },
        { ifIncludes: '보아요', why: '보 + 아요 сливается в [[kr|봐요]].' },
      ],
      errorType: 'particle',
    },
  ],
};

export const eeseo: Lesson = {
  id: 'g1-u3-l3',
  grade: 1,
  unit: 3,
  title: 'Где? 에 и 에서',
  short: 'Места 에 / 에서',
  minutes: 14,
  skill: 'core',
  words: [
    { id: 'w-hakgyo', kr: '학교', ru: 'школа', pron: '[학꾜]' },
    { id: 'w-doseogwan', kr: '도서관', ru: 'библиотека' },
    { id: 'w-sikdang', kr: '식당', ru: 'столовая, ресторан', pron: '[식땅]' },
    { id: 'w-kape', kr: '카페', ru: 'кафе' },
    { id: 'w-ilhada', kr: '일하다', ru: 'работать' },
  ],
  steps: [
    {
      kind: 'board',
      title: 'Две частицы места',
      sub: 'По-русски оба — «в», по-корейски это разные вещи.',
      lines: [
        '[[a|에]] — куда (с 가다, 오다): 학교[[a|에]] 가요',
        '[[a|에]] — где находится (с 있다/없다): 집[[a|에]] 있어요',
        '[[b|에서]] — где происходит действие: 도서관[[b|에서]] 공부해요',
        'Проверка: есть ли действие в этом месте? Да → [[b|에서]]',
      ],
      table: {
        head: ['Глагол', 'Частица', 'Пример'],
        rows: [
          ['가다, 오다', '에', '카페에 가요'],
          ['있다, 없다', '에', '학교에 있어요'],
          ['먹다, 공부하다, 일하다…', '에서', '식당에서 먹어요'],
        ],
      },
    },
    {
      kind: 'choice',
      title: '에 или 에서?',
      items: [
        { prompt: '학교___ 가요.', options: ['에', '에서'], answer: 0, why: 'Направление с 가다 → [[kr|에]].', errorType: 'particle' },
        { prompt: '도서관___ 책을 읽어요.', options: ['에', '에서'], answer: 1, why: 'Действие (читаю) в месте → [[kr|에서]].', errorType: 'particle' },
        { prompt: '안나 씨는 집___ 있어요.', options: ['에', '에서'], answer: 0, why: 'Нахождение с 있다 → [[kr|에]].', errorType: 'particle' },
        { prompt: '식당___ 밥을 먹어요.', options: ['에', '에서'], answer: 1, why: 'Ем в столовой — действие → [[kr|에서]].', errorType: 'particle' },
        { prompt: '저는 회사___ 일해요.', options: ['에', '에서'], answer: 1, why: 'Работаю — действие → [[kr|에서]].', errorType: 'particle' },
      ],
    },
    {
      kind: 'build',
      title: 'Составьте',
      ru: 'Я учусь в библиотеке.',
      target: ['저는', '도서관에서', '공부해요'],
      pool: ['공부해요', '도서관에', '저는', '도서관에서', '공부하요'],
      hints: [
        { ifIncludes: '도서관에', why: 'Учиться — действие в месте → [[kr|에서]].' },
        { ifIncludes: '공부하요', why: '하다 → [[kr|해요]]: 공부해요.' },
      ],
      errorType: 'particle',
    },
  ],
  outro: 'Юнит «Мой день» пройден: вы описываете, кто что делает и где.',
};
