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

// ---------- Другие формы 1급 ----------

export type Form =
  | 'past' | 'formal' | 'formalQ' | 'seyo' | 'future' | 'lkkayo' | 'want' | 'an' | 'ji'
  // 2급
  | 'tryPast' | 'trySeyo' | 'experience' | 'can' | 'cannot' | 'must' | 'progressive' | 'jiman' | 'myeon' | 'reo' | 'ryeogo' | 'giro'
  // определительные формы: глагол сейчас, прилагательное, глагол в прошлом, будущее
  | 'attrV' | 'attrA' | 'attrPast' | 'attrFut';

export const addJong = (syl: string, jong: string) => {
  const d = decompose(syl)!;
  return compose(d.cho, d.jung, jong)!;
};

/** Основа для окончаний на 으: 먹 → 먹으, 가 → 가, 살 → 사(ㄹ выпадает перед ㅅ/ㅂ/ㄴ), 돕 → 도우, 듣 → 들으. */
export function stemForEu(verb: string, before: 'ㅅ' | 'ㄹ'): { base: string; vowelEnd: boolean } {
  const stem = stemOf(verb);
  const last = stem[stem.length - 1];
  const s = decompose(last)!;
  if (!s.jong) return { base: stem, vowelEnd: true };
  if (s.jong === 'ㄹ') return before === 'ㅅ' ? { base: replaceLast(stem, compose(s.cho, s.jung)!), vowelEnd: true } : { base: stem, vowelEnd: false };
  if (s.jong === 'ㅂ' && IRREGULAR_B.has(stem)) return { base: replaceLast(stem, compose(s.cho, s.jung)!) + '우', vowelEnd: true };
  if (s.jong === 'ㄷ' && IRREGULAR_D.has(stem)) return { base: replaceLast(stem, compose(s.cho, s.jung, 'ㄹ')!) + '으', vowelEnd: true };
  if (s.jong === 'ㅅ' && IRREGULAR_S.has(stem)) return { base: replaceLast(stem, compose(s.cho, s.jung)!) + '으', vowelEnd: true };
  if (s.jong === 'ㅎ' && IRREGULAR_H.has(stem)) return { base: replaceLast(stem, compose(s.cho, s.jung)!), vowelEnd: true };
  return { base: stem + '으', vowelEnd: true };
}

/** Основа + ㄹ (будущее, -까요): 가 → 갈, 먹으 → 먹을, 살 → 살. */
function withL(verb: string): string {
  const stem = stemOf(verb);
  const s = decompose(stem[stem.length - 1])!;
  if (s.jong === 'ㄹ') return stem;
  const { base } = stemForEu(verb, 'ㄹ');
  return replaceLast(base, addJong(base[base.length - 1], 'ㄹ'));
}

/** Основа + ㄴ (определение прошедшего, -(으)ㄴ 적이 있다): 가 → 간, 먹으 → 먹은, 살 → 산, 듣 → 들은, 돕 → 도운. */
function withN(verb: string): string {
  const { base } = stemForEu(verb, 'ㅅ');
  return replaceLast(base, addJong(base[base.length - 1], 'ㄴ'));
}

/** Основа для -(으)면, -(으)러, -(으)려고: основа на ㄹ сохраняет ㄹ и не берёт 으. */
const euKeepL = (verb: string) => stemForEu(verb, 'ㄹ').base;

/** -는: основа на ㄹ теряет ㄹ (살다 → 사는). */
function withNeun(verb: string): string {
  const stem = stemOf(verb);
  const s = decompose(stem[stem.length - 1])!;
  return (s.jong === 'ㄹ' ? replaceLast(stem, compose(s.cho, s.jung)!) : stem) + '는';
}

/** 있다, 없다 и слова на них (맛있다, 재미없다) в определении ведут себя как глаголы: 맛있는. */
export const takesNeun = (verb: string) => /[있없]다$/.test(verb);
const info = (verb: string) => haeyo(verb).slice(0, -1);

export function conj(verb: string, form: Form): string {
  const stem = stemOf(verb);
  const last = stem[stem.length - 1];
  const s = decompose(last)!;
  switch (form) {
    case 'past': {
      if (verb === '이다') return '이었어요';
      const info = haeyo(verb).slice(0, -1); // 가, 먹어, 해, 마셔
      return replaceLast(info, addJong(info[info.length - 1], 'ㅆ')) + '어요';
    }
    case 'formal':
    case 'formalQ': {
      const tail = form === 'formal' ? '니다' : '니까';
      if (!s.jong) return replaceLast(stem, addJong(last, 'ㅂ')) + tail;
      if (s.jong === 'ㄹ') return replaceLast(stem, compose(s.cho, s.jung, 'ㅂ')!) + tail;
      return stem + '습' + tail;
    }
    case 'seyo': {
      const { base } = stemForEu(verb, 'ㅅ');
      return base + '세요';
    }
    case 'future':
      return withL(verb) + ' 거예요';
    case 'lkkayo':
      return withL(verb) + '까요';
    case 'want':
      return stem + '고 싶어요';
    case 'an':
      if (stem.length > 1 && stem.endsWith('하') && !['좋아하', '싫어하'].includes(stem)) return `${stem.slice(0, -1)} 안 해요`;
      return `안 ${haeyo(verb)}`;
    case 'ji':
      return stem + '지 않아요';
    case 'tryPast':
      return `${info(verb)} 봤어요`;
    case 'trySeyo':
      return `${info(verb)} 보세요`;
    case 'experience':
      return `${withN(verb)} 적이 있어요`;
    case 'can':
      return `${withL(verb)} 수 있어요`;
    case 'cannot':
      return `${withL(verb)} 수 없어요`;
    case 'must':
      return `${info(verb)}야 해요`;
    case 'progressive':
      return `${stem}고 있어요`;
    case 'jiman':
      return `${stem}지만`;
    case 'myeon':
      return `${euKeepL(verb)}면`;
    case 'reo':
      return `${euKeepL(verb)}러 가요`;
    case 'ryeogo':
      return `${euKeepL(verb)}려고 해요`;
    case 'giro':
      return `${stem}기로 했어요`;
    case 'attrV':
      return withNeun(verb);
    case 'attrA':
      return takesNeun(verb) ? withNeun(verb) : withN(verb);
    case 'attrPast':
      return withN(verb);
    case 'attrFut':
      return withL(verb);
  }
}

/** Правдоподобные ошибки для каждой формы (не совпадают с верной). */
export function conjDistractors(verb: string, form: Form): string[] {
  const stem = stemOf(verb);
  const right = conj(verb, form);
  const s = decompose(stem[stem.length - 1])!;
  const vowel = !s.jong;
  let c: string[] = [];
  switch (form) {
    case 'past':
      c = [stem + '었어요', stem + '았어요', haeyo(verb)];
      break;
    case 'formal':
      c = vowel ? [stem + '습니다', stem + '니다'] : [stem + '읍니다', stem + '니다'];
      break;
    case 'formalQ':
      c = vowel ? [stem + '습니까', stem + '니까'] : [stem + '읍니까', stem + '니까'];
      break;
    case 'seyo':
      c = [vowel ? stem + '으세요' : stem + '세요', stem + '으세요', haeyo(verb)];
      break;
    case 'future':
      c = [vowel ? stem + '을 거예요' : stem + ' 거예요', stem + '는 거예요', haeyo(verb)];
      break;
    case 'lkkayo':
      c = [vowel ? stem + '을까요' : stem + '까요', haeyo(verb).slice(0, -1) + '까요'];
      break;
    case 'want':
      c = [stem + '기 싶어요', haeyo(verb).slice(0, -1) + '고 싶어요', stem + '고 싶어해요'];
      break;
    case 'an':
      // Для N+하다 норма — «공부 안 해요»; «안 공부해요» оставляем как ловушку.
      c = [`안 ${haeyo(verb)}`, `${haeyo(verb)} 안`, `안 ${verb}`];
      break;
    case 'ji':
      c = [stem + '지 안아요', stem + '지 않어요'];
      break;
    case 'tryPast':
      c = [`${stem}아 봤어요`, `${stem}어 봤어요`, `${stem}기 봤어요`];
      break;
    case 'trySeyo':
      c = [`${stem}아 보세요`, `${stem}어 보세요`, `${stem}기 보세요`];
      break;
    case 'experience':
      c = [vowel ? `${stem}은 적이 있어요` : `${stem} 적이 있어요`, `${stem}는 적이 있어요`, `${withL(verb)} 적이 있어요`];
      break;
    case 'can':
    case 'cannot': {
      const tail = form === 'can' ? '수 있어요' : '수 없어요';
      c = [vowel ? `${stem}을 ${tail}` : `${stem} ${tail}`, `${stem}는 ${tail}`, `${stem}고 ${tail}`];
      break;
    }
    case 'must':
      c = [`${stem}야 해요`, `${stem}고 해야 해요`, `${stem}${vowel ? '어' : '아'}야 해요`];
      break;
    case 'progressive':
      c = [`${stem}는 있어요`, `${stem}기 있어요`, `${stem}고 있다요`];
      break;
    case 'jiman':
      c = [`${info(verb)}지만`, `${stem}치만`];
      break;
    case 'myeon':
      c = [vowel ? `${stem}으면` : `${stem}면`, `${info(verb)}면`];
      break;
    case 'reo':
      c = [vowel ? `${stem}으러 가요` : `${stem}러 가요`, `${stem}려 가요`, `${stem}기 가요`];
      break;
    case 'ryeogo':
      c = [vowel ? `${stem}으려고 해요` : `${stem}려고 해요`, `${stem}러고 해요`];
      break;
    case 'giro':
      c = [`${stem}기를 했어요`, `${stem}고로 했어요`];
      break;
    case 'attrV':
      c = [withN(verb), withL(verb), s.jong === 'ㄹ' ? `${stem}는` : `${stem}${vowel ? '은' : '는'}`];
      break;
    case 'attrA':
      // Ловушки: -는 у прилагательного, «сырое» -은 без учёта нерегулярности и сказуемое вместо определения (좋아요 날).
      c = takesNeun(verb) ? [`${stem}은`, haeyo(verb)] : [`${stem}는`, `${stem}은`, haeyo(verb)];
      break;
    case 'attrPast':
      c = [withNeun(verb), withL(verb), vowel ? `${stem}은` : `${stem}는`];
      break;
    case 'attrFut':
      c = [withN(verb), withNeun(verb), vowel ? `${stem}을` : `${stem}를`];
      break;
  }
  return [...new Set(c.filter((x) => x && x !== right))];
}

export type IrregularType = 'ㅂ' | 'ㄷ' | 'ㅅ' | 'ㅎ' | '르' | 'ㄹ' | 'ㅡ' | '하다' | null;

/** Тип спряжения для подсказки в словаре. ㄹ и ㅡ — регулярные, но с выпадением. */
export function irregularType(verb: string): IrregularType {
  const stem = stemOf(verb);
  const last = stem[stem.length - 1];
  const s = decompose(last);
  if (!s) return null;
  if (stem.endsWith('하')) return '하다';
  if (s.jong === 'ㅂ' && IRREGULAR_B.has(stem)) return 'ㅂ';
  if (s.jong === 'ㄷ' && IRREGULAR_D.has(stem)) return 'ㄷ';
  if (s.jong === 'ㅅ' && IRREGULAR_S.has(stem)) return 'ㅅ';
  if (s.jong === 'ㅎ' && IRREGULAR_H.has(stem)) return 'ㅎ';
  if (last === '르' && stem.length > 1 && !REGULAR_REU.has(stem)) return '르';
  if (s.jong === 'ㄹ') return 'ㄹ';
  if (!s.jong && s.jung === 'ㅡ') return 'ㅡ';
  return null;
}
