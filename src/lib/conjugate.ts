// Спряжение в стиле 해요체 (настоящее время, -아/어요).
// Правило гармонии: если последний слог основы содержит ㅏ или ㅗ — -아요, иначе -어요; 하다 → 해요.
import { compose, decompose } from './hangul';

/** Нерегулярные основы (без 다). Остальные с тем же патчимом спрягаются регулярно. */
const IRREGULAR_B = new Set(['돕', '덥', '춥', '쉽', '어렵', '맵', '가깝', '귀엽', '무섭', '뜨겁', '차갑', '반갑', '즐겁', '아름답', '고맙', '가볍', '무겁', '눕', '굽']);
const IRREGULAR_D = new Set(['듣', '걷', '묻', '깨닫', '싣']);
const IRREGULAR_S = new Set(['낫', '짓', '붓', '잇', '젓']);
const IRREGULAR_H = new Set(['그렇', '이렇', '저렇', '어떻', '빨갛', '노랗', '파랗', '하얗', '까맣']);
const REGULAR_REU = new Set(['따르', '치르', '들르']);

export function stemOf(verb: string): string {
  if (!verb.endsWith('다') || verb.length < 2) throw new Error(`Не словарная форма: ${verb}`);
  return verb.slice(0, -1);
}

const replaceLast = (stem: string, ch: string) => stem.slice(0, -1) + ch;
const isBright = (jung: string) => jung === 'ㅏ' || jung === 'ㅗ';

export function haeyo(verb: string): string {
  if (verb === '이다') return '이에요';
  if (verb === '아니다') return '아니에요';
  const stem = stemOf(verb);
  if (stem.endsWith('하')) return replaceLast(stem, '해') + '요';
  const last = stem[stem.length - 1];
  const s = decompose(last);
  if (!s) throw new Error(`Не хангыль: ${verb}`);
  const prev = stem.length > 1 ? decompose(stem[stem.length - 2]) : null;

  if (s.jong) {
    if (s.jong === 'ㅂ' && IRREGULAR_B.has(stem)) {
      const base = replaceLast(stem, compose(s.cho, s.jung)!);
      // 돕다, 곱다 → 도와요; остальные → -워요
      return base + (stem === '돕' || stem === '곱' ? '와요' : '워요');
    }
    if (s.jong === 'ㄷ' && IRREGULAR_D.has(stem)) return replaceLast(stem, compose(s.cho, s.jung, 'ㄹ')!) + (isBright(s.jung) ? '아요' : '어요');
    if (s.jong === 'ㅅ' && IRREGULAR_S.has(stem)) return replaceLast(stem, compose(s.cho, s.jung)!) + (isBright(s.jung) ? '아요' : '어요');
    if (s.jong === 'ㅎ' && IRREGULAR_H.has(stem)) {
      const j = s.jung === 'ㅑ' ? 'ㅒ' : 'ㅐ';
      return replaceLast(stem, compose(s.cho, j)!) + '요';
    }
    return stem + (isBright(s.jung) ? '아요' : '어요');
  }

  switch (s.jung) {
    case 'ㅏ':
    case 'ㅓ':
    case 'ㅐ':
    case 'ㅔ':
    case 'ㅕ':
      return stem + '요';
    case 'ㅗ':
      return replaceLast(stem, compose(s.cho, 'ㅘ')!) + '요';
    case 'ㅜ':
      return replaceLast(stem, compose(s.cho, 'ㅝ')!) + '요';
    case 'ㅣ':
      return replaceLast(stem, compose(s.cho, 'ㅕ')!) + '요';
    case 'ㅚ':
      return replaceLast(stem, compose(s.cho, 'ㅙ')!) + '요';
    case 'ㅡ': {
      const bright = prev ? isBright(prev.jung) : false;
      if (last === '르' && prev && !REGULAR_REU.has(stem)) {
        // 르-нерегулярные: 모르다 → 몰라요, 부르다 → 불러요
        const head = stem.slice(0, -2) + compose(prev.cho, prev.jung, 'ㄹ')!;
        return head + (bright ? '라요' : '러요');
      }
      return replaceLast(stem, compose(s.cho, bright ? 'ㅏ' : 'ㅓ')!) + '요';
    }
    default:
      return stem + '어요';
  }
}

/** Типичные ошибки ученика — для вариантов ответа. */
export function haeyoDistractors(verb: string): string[] {
  const stem = stemOf(verb);
  const right = haeyo(verb);
  const cands = [stem + '어요', stem + '아요', stem + '요', stem.endsWith('하') ? stem + '여요' : '', right.endsWith('워요') ? right.replace(/워요$/, '와요') : ''];
  return [...new Set(cands.filter((c) => c && c !== right))];
}
