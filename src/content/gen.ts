// Генераторы заданий: формы и числа считаются движком, а не пишутся руками — без опечаток.
import { haeyo, haeyoDistractors, stemOf } from '../lib/conjugate';
import { formatWon, sino } from '../lib/numbers';
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
