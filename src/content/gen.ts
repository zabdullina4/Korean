// Генераторы заданий: формы и числа считаются движком, а не пишутся руками — без опечаток.
import { conj, conjDistractors, haeyo, haeyoDistractors, stemOf, type Form } from '../lib/conjugate';
import { clock, formatWon, native, nativeCounter, sino } from '../lib/numbers';
import { hash, rng, shuffle } from '../lib/random';
import type { ChoiceItem } from './types';

function ordered(right: string, wrong: string[], key: string): { options: string[]; answer: number } {
  const options = shuffle([right, ...wrong], rng(hash(key)));
  return { options, answer: options.indexOf(right) };
}

export function haeyoItem(verb: string, ru: string): ChoiceItem {
  const right = haeyo(verb);
  const stem = stemOf(verb);
  const last = stem[stem.length - 1];
  const why = stem.endsWith('하')
    ? `하다 → [[kr|해요]]: ${verb} → [[kr|${right}]].`
    : `Основа [[kr|${stem}]], последний слог [[kr|${last}]] → [[kr|${right}]].`;
  return { prompt: verb, ru, ...ordered(right, haeyoDistractors(verb).slice(0, 2), verb), why, errorType: 'ending' };
}

export function priceReadItem(n: number): ChoiceItem {
  const right = `${sino(n)} 원`;
  const wrong = [n * 10, Math.max(1, Math.round(n / 10))].filter((x) => x !== n).map((x) => `${sino(x)} 원`);
  return { prompt: formatWon(n), ru: 'Как прочитать цену?', ...ordered(right, wrong, `p${n}`), why: `${formatWon(n)} — [[kr|${right}]].`, errorType: 'vocab' };
}

export function priceListenItem(n: number): ChoiceItem {
  const wrong = [n * 10, Math.max(1, Math.round(n / 10))].filter((x) => x !== n).map(formatWon);
  return { prompt: '___', audio: `${sino(n)} 원`, ru: 'Сколько это стоит?', ...ordered(formatWon(n), wrong, `l${n}`), why: `Звучало [[kr|${sino(n)} 원]] = ${formatWon(n)}.`, errorType: 'vocab' };
}

export function numberItem(n: number): ChoiceItem {
  const near = [n + 10 > 99 ? n - 10 : n + 10, n % 10 ? n - (n % 10) + ((n % 10) % 9) + 1 : n + 1].filter((x) => x !== n && x > 0);
  return { prompt: String(n), ...ordered(sino(n), [...new Set(near)].slice(0, 2).map(sino), `n${n}`), why: `${n} — [[kr|${sino(n)}]].`, errorType: 'vocab' };
}

const FORM_RULE: Record<Form, (right: string, verb: string) => string> = {
  past: (r, v) => `Прошедшее: форма -아/어요 + ㅆ → ${v} → [[kr|${r}]].`,
  formal: (r) => `После гласной и ㄹ — -ㅂ니다, после согласной — -습니다: [[kr|${r}]].`,
  formalQ: (r) => `Вопрос в стиле 합니다: [[kr|${r}]].`,
  seyo: (r) => `После гласной -세요, после согласной -으세요, ㄹ выпадает: [[kr|${r}]].`,
  future: (r) => `После гласной -ㄹ 거예요, после согласной -을 거예요: [[kr|${r}]].`,
  lkkayo: (r) => `После гласной -ㄹ까요, после согласной -을까요: [[kr|${r}]].`,
  want: (r) => `Основа + -고 싶어요: [[kr|${r}]].`,
  an: (r) => (r.includes(' 안 ') ? `У глаголов «существительное + 하다» 안 встаёт перед 하다: [[kr|${r}]].` : `안 ставится перед глаголом: [[kr|${r}]].`),
  ji: (r) => `Основа + -지 않아요: [[kr|${r}]].`,
  tryPast: (r) => `Форма -아/어 + 보다: [[kr|${r}]] — «попробовал».`,
  trySeyo: (r) => `Форма -아/어 + 보세요: [[kr|${r}]] — «попробуйте».`,
  experience: (r) => `После гласной -ㄴ, после согласной -은 + 적이 있어요: [[kr|${r}]].`,
  can: (r) => `После гласной -ㄹ, после согласной -을 + 수 있어요: [[kr|${r}]].`,
  cannot: (r) => `После гласной -ㄹ, после согласной -을 + 수 없어요: [[kr|${r}]].`,
  must: (r) => `Форма -아/어 + 야 해요: [[kr|${r}]].`,
  progressive: (r) => `Основа + -고 있어요, без исключений: [[kr|${r}]].`,
  jiman: (r) => `Основа + -지만, без исключений: [[kr|${r}]].`,
  myeon: (r) => `После гласной и ㄹ -면, после согласной -으면: [[kr|${r}]].`,
  reo: (r) => `После гласной и ㄹ -러, после согласной -으러: [[kr|${r}]].`,
  ryeogo: (r) => `После гласной и ㄹ -려고, после согласной -으려고: [[kr|${r}]].`,
  giro: (r) => `Основа + -기로 하다: [[kr|${r}]] — «решили».`,
  attrV: (r) => `Глагол в настоящем: основа + -는 (ㄹ выпадает): [[kr|${r}]].`,
  attrA: (r, v) =>
    /[있없]다$/.test(v)
      ? `Слова на 있다/없다 ведут себя как глаголы: -는 → [[kr|${r}]].`
      : `Прилагательное: после гласной -ㄴ, после согласной -은: [[kr|${r}]].`,
  attrPast: (r) => `Глагол в прошлом: после гласной -ㄴ, после согласной -은: [[kr|${r}]].`,
  attrFut: (r) => `Будущее и предположение: после гласной -ㄹ, после согласной -을: [[kr|${r}]].`,
  ttae: (r) => `Определительная форма -(으)ㄹ + 때: [[kr|${r}]].`,
  pastTtae: (r) => `Прошедшее -았/었- + -을 때: [[kr|${r}]].`,
  jeone: (r) => `Основа без изменений + -기 전에: [[kr|${r}]].`,
  hue: (r) => `Определительная форма прошедшего -(으)ㄴ + 후에: [[kr|${r}]].`,
  myeonseo: (r) => `После гласной и ㄹ -면서, после согласной -으면서: [[kr|${r}]].`,
  dongan: (r) => `Определительная форма -는 + 동안: [[kr|${r}]].`,
};

/** Определение + существительное: «가다 → ___ 사람» → «가는 사람». */
export function attrItem(verb: string, form: 'attrV' | 'attrA' | 'attrPast' | 'attrFut', noun: string, ru: string): ChoiceItem {
  const right = `${conj(verb, form)} ${noun}`;
  const wrong = conjDistractors(verb, form)
    .slice(0, 2)
    .map((d) => `${d} ${noun}`);
  return { prompt: `${verb} + ${noun}`, ru, ...ordered(right, wrong, `${form}:${verb}:${noun}`), why: FORM_RULE[form](conj(verb, form), verb), errorType: 'ending' };
}

export function formItem(verb: string, form: Form, ru: string): ChoiceItem {
  const right = conj(verb, form);
  return { prompt: verb, ru, ...ordered(right, conjDistractors(verb, form).slice(0, 2), `${form}:${verb}`), why: FORM_RULE[form](right, verb), errorType: 'ending' };
}

export function counterItem(n: number, noun: string, counter: string, ru: string): ChoiceItem {
  const right = `${noun} ${nativeCounter(n)} ${counter}`;
  const wrong = [`${noun} ${native(n)} ${counter}`, `${noun} ${sino(n)} ${counter}`].filter((x) => x !== right);
  return { prompt: ru, ...ordered(right, [...new Set(wrong)], `c${n}${counter}`), why: `С ${counter} — исконное число в счётной форме: [[kr|${nativeCounter(n)} ${counter}]].`, errorType: 'vocab' };
}

const hhmm = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;

export function clockItem(h: number, m: number): ChoiceItem {
  const right = clock(h, m);
  const hh = ((h + 11) % 12) + 1;
  const wrong = [m ? `${sino(hh)} 시 ${sino(m)} 분` : `${sino(hh)} 시`, m ? `${nativeCounter(hh)} 시 ${native(m > 99 ? 1 : m)} 분` : `${native(hh)} 시`];
  return { prompt: hhmm(h, m), ru: 'Как сказать время?', ...ordered(right, [...new Set(wrong)].filter((x) => x !== right), `t${h}${m}`), why: `Часы — исконными (${nativeCounter(hh)} 시), минуты — сино-корейскими: [[kr|${right}]].`, errorType: 'vocab' };
}

export function clockListenItem(h: number, m: number): ChoiceItem {
  const right = hhmm(h, m);
  const wrong = [hhmm(h, (m + 20) % 60), hhmm(((h + 1) % 12) + 1, m)];
  return { prompt: '___', audio: clock(h, m), ru: 'Который час?', ...ordered(right, wrong, `lt${h}${m}`), why: `Звучало [[kr|${clock(h, m)}]].`, errorType: 'vocab' };
}
