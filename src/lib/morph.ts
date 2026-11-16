// Морфологический разбор словоформ.
// Глаголы и прилагательные: «генерируй и сверяй» — для каждой основы из словаря движок спряжения строит
// формы по шаблонам, и введённая форма ищется в обратном индексе. Так разбор всегда согласован с уроками.
// Существительные: отделяем частицы и связку справа, проверяем согласование (은/는, 이/가, 을/를…).
import type { DictEntry, Pos } from '../content/dictionary';
import { addJong, conj, eum, haeyo, irregularType, neunda, stemForEu, stemOf } from './conjugate';
import { decompose } from './hangul';

export type MorphKind = 'stem' | 'honor' | 'tense' | 'ending' | 'particle' | 'copula';

export interface Morph {
  form: string;
  kind: MorphKind;
  gloss: string;
  lessonId?: string;
}

export interface Analysis {
  surface: string;
  lemma: string;
  pos: Pos | '?';
  entry?: DictEntry;
  chain: Morph[];
  /** Пояснение: нерегулярность, стяжение. */
  note?: string;
  /** Ошибка согласования: «학생는» → «학생은». */
  warning?: string;
  score: number;
}

// ---------- Глаголы ----------

const L = {
  haeyo: 'g1-u3-l1',
  past: 'g1-u6-l1',
  formal: 'g1-u10-l1',
  seyo: 'g1-u9-l1',
  future: 'g1-u8-l1',
  lkkayo: 'g1-u9-l2',
  want: 'g1-u8-l2',
  neg: 'g1-u7-l1',
  reason: 'g2-u7-l4',
  copula: 'g1-u1-l1',
};

const hasJong = (syl: string) => !!decompose(syl)?.jong;
const lastSyl = (s: string) => s[s.length - 1];

/** Гармония для окончаний -아/어: 아 после ㅏ/ㅗ, 어 — остальные, 하다 → 여 (해). */
function harmony(verb: string): '아' | '어' | '여' {
  const stem = stemOf(verb);
  if (stem.endsWith('하')) return '여';
  const info = haeyo(verb).slice(0, -1);
  const j = decompose(lastSyl(info))?.jung;
  return j === 'ㅏ' || j === 'ㅘ' || j === 'ㅑ' ? '아' : '어';
}

/** Вариант окончания с 으 выбирается по основе: согласная (кроме ㄹ) → -으니까, -은; у нерегулярных тоже (춥 + -은 → 추운). */
function euEnding(stem: string): boolean {
  const j = decompose(lastSyl(stem))?.jong;
  return !!j && j !== 'ㄹ';
}

/** Основа + окончание на 으 (니까, 면, 세요, 러, 려고). Перед ㄴ/ㅅ основа на ㄹ теряет ㄹ. */
function withEu(verb: string, ending: string): { form: string; eu: boolean } {
  const mode = /^[니세시십]/.test(ending) ? 'ㅅ' : 'ㄹ';
  const stem = stemOf(verb);
  const { base } = stemForEu(verb, mode);
  return { form: base + ending, eu: euEnding(stem) };
}

/** Основа + окончание-согласная, которая садится в патчим: -(으)ㄹ, -(으)ㄴ, -(으)ㅂ시다. */
function withJamo(verb: string, jamo: 'ㄹ' | 'ㄴ' | 'ㅂ', rest: string): { form: string; eu: boolean } {
  const stem = stemOf(verb);
  const s = decompose(lastSyl(stem))!;
  if (s.jong === 'ㄹ' && jamo === 'ㄹ') return { form: stem + rest, eu: false };
  const { base } = stemForEu(verb, jamo === 'ㄹ' ? 'ㄹ' : 'ㅅ');
  return { form: base.slice(0, -1) + addJong(lastSyl(base), jamo) + rest, eu: euEnding(stem) };
}

/** Основа + окончание на согласную (고, 지, 지만, 네요, 는, 기, 느라고). Основа на ㄹ теряет ㄹ перед ㄴ. */
function withC(verb: string, ending: string): string {
  const stem = stemOf(verb);
  const s = decompose(lastSyl(stem))!;
  if (s.jong === 'ㄹ' && /^[는네느]/.test(ending)) return stem.slice(0, -1) + addJong(lastSyl(stem), '') + ending;
  return stem + ending;
}

const pastStem = (verb: string) => conj(verb, 'past').slice(0, -2); // 먹었어요 → 먹었
const pastMark = (verb: string): Morph => {
  const h = harmony(verb);
  return { form: h === '여' ? '-였-' : h === '아' ? '-았-' : '-었-', kind: 'tense', gloss: 'прошедшее время', lessonId: L.past };
};
const honor = (eu: boolean): Morph => ({ form: eu ? '-으시-' : '-시-', kind: 'honor', gloss: 'почтительность к тому, кто действует', lessonId: 'g2-u8-l1' });
const end = (form: string, gloss: string, lessonId?: string): Morph => ({ form, kind: 'ending', gloss, lessonId });
const eu = (flag: boolean, tail: string) => `-${flag ? '으' : ''}${tail}`;
/** -(으)ㄹ / -(으)ㄴ / -(으)ㅂ: после согласной 으 и согласная сливаются в слог (을, 은, 읍). */
const euJ = (flag: boolean, jamo: 'ㄹ' | 'ㄴ' | 'ㅂ', rest = '') => `-${flag ? addJong('으', jamo) : jamo}${rest}`;

interface Template {
  id: string;
  /** Для каких частей речи (по умолчанию — глаголы и прилагательные). */
  only?: Pos[];
  build(verb: string, pos: Pos): { form: string; chain: Morph[] } | null;
}

const T: Template[] = [
  { id: 'haeyo', build: (v) => ({ form: haeyo(v), chain: [end(`-${harmony(v)}요`, 'вежливое окончание 해요체: утверждение, вопрос или предложение', L.haeyo)] }) },
  { id: 'banmal', build: (v) => ({ form: haeyo(v).slice(0, -1), chain: [end(`-${harmony(v)}`, 'неформальная речь (반말) или связка перед 주다, 보다, 있다')] }) },
  { id: 'past', build: (v) => ({ form: conj(v, 'past'), chain: [pastMark(v), end('-어요', 'вежливое окончание 해요체', L.haeyo)] }) },
  { id: 'pastBanmal', build: (v) => ({ form: pastStem(v) + '어', chain: [pastMark(v), end('-어', 'неформальная речь (반말)')] }) },
  {
    id: 'formal',
    build: (v) => {
      const f = conj(v, 'formal');
      return { form: f, chain: [end(f.endsWith('습니다') ? '-습니다' : '-ㅂ니다', 'официально-вежливое окончание 합니다체', L.formal)] };
    },
  },
  {
    id: 'formalQ',
    build: (v) => {
      const f = conj(v, 'formalQ');
      return { form: f, chain: [end(f.endsWith('습니까') ? '-습니까' : '-ㅂ니까', 'вопрос в стиле 합니다체', L.formal)] };
    },
  },
  { id: 'pastFormal', build: (v) => ({ form: pastStem(v) + '습니다', chain: [pastMark(v), end('-습니다', 'официально-вежливое окончание 합니다체', L.formal)] }) },
  { id: 'pastFormalQ', build: (v) => ({ form: pastStem(v) + '습니까', chain: [pastMark(v), end('-습니까', 'вопрос в стиле 합니다체', L.formal)] }) },
  {
    id: 'seyo',
    build: (v) => {
      const r = withEu(v, '세요');
      return { form: r.form, chain: [end(eu(r.eu, '세요'), 'вежливая просьба «пожалуйста, …» или почтительный вопрос', L.seyo)] };
    },
  },
  {
    id: 'honPast',
    build: (v) => {
      const r = withEu(v, '셨어요');
      return { form: r.form, chain: [honor(r.eu), { form: '-었-', kind: 'tense', gloss: 'прошедшее время', lessonId: L.past }, end('-어요', 'вежливое окончание 해요체', L.haeyo)] };
    },
  },
  {
    id: 'honFormal',
    build: (v) => {
      const r = withEu(v, '십니다');
      return { form: r.form, chain: [honor(r.eu), end('-ㅂ니다', 'официально-вежливое окончание', L.formal)] };
    },
  },
  {
    id: 'honFormalQ',
    build: (v) => {
      const r = withEu(v, '십니까');
      return { form: r.form, chain: [honor(r.eu), end('-ㅂ니까', 'вопрос в стиле 합니다체', L.formal)] };
    },
  },
  {
    id: 'attrFuture',
    build: (v) => {
      const r = withJamo(v, 'ㄹ', '');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄹ'), 'определительная форма будущего: 할 일 «дела»; с 때 — «когда» (юнит 6), с 거예요 — «буду»', 'g2-u5-l3')] };
    },
  },
  {
    id: 'lkkayo',
    build: (v) => {
      const r = withJamo(v, 'ㄹ', '까요');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄹ', '까요'), 'предложение «давайте?» или вопрос «мне сделать?»', L.lkkayo)] };
    },
  },
  {
    id: 'psida',
    only: ['v'],
    build: (v) => {
      const r = withJamo(v, 'ㅂ', '시다');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㅂ', '시다'), '«давайте» (к равным и младшим)', L.lkkayo)] };
    },
  },
  {
    id: 'attrPast',
    build: (v, pos) => {
      const r = withJamo(v, 'ㄴ', '');
      return {
        form: r.form,
        chain: [
          pos === 'v'
            ? end(euJ(r.eu, 'ㄴ'), 'определительная форма прошедшего: «который сделал»', 'g2-u5-l3')
            : end(euJ(r.eu, 'ㄴ'), 'определительная форма прилагательного: «какой» (좋은 사람 — хороший человек)', 'g2-u5-l2'),
        ],
      };
    },
  },
  { id: 'attrPresent', only: ['v', 'aux'], build: (v) => ({ form: withC(v, '는'), chain: [end('-는', 'определительная форма настоящего: «который делает»', 'g2-u5-l1')] }) },
  { id: 'go', build: (v) => ({ form: v.slice(0, -1) + '고', chain: [end('-고', '«и», «и затем»; перед 싶다 — «хотеть», перед 있다 — «сейчас делаю»', L.want)] }) },
  { id: 'ji', build: (v) => ({ form: v.slice(0, -1) + '지', chain: [end('-지', 'перед 않다 / 못하다 / 마세요 — отрицание; в конце фразы — «ведь…»', L.neg)] }) },
  { id: 'jiyo', build: (v) => ({ form: v.slice(0, -1) + '지요', chain: [end('-지요 (-죠)', '«ведь…, не так ли?» — ожидание согласия')] }) },
  { id: 'jyo', build: (v) => ({ form: v.slice(0, -1) + '죠', chain: [end('-죠', 'сокращение от -지요: «ведь…, правда?»', 'g2-u10-l2')] }) },
  { id: 'jiman', build: (v) => ({ form: v.slice(0, -1) + '지만', chain: [end('-지만', '«но, однако»', 'g2-u3-l2')] }) },
  { id: 'neyo', build: (v) => ({ form: withC(v, '네요'), chain: [end('-네요', 'удивление или открытие: «оказывается…, надо же»', 'g2-u10-l2')] }) },
  { id: 'giro', only: ['v'], build: (v) => ({ form: v.slice(0, -1) + '기로', chain: [end('-기로', 'с 하다 — «решить, договориться» (만나기로 했어요)', 'g2-u4-l2')] }) },
  { id: 'gi', build: (v) => ({ form: v.slice(0, -1) + '기', chain: [end('-기', 'отглагольное существительное: «-ние» (읽기 — чтение); с 전에 — «перед тем как», с 때문에 — «потому что»', 'g2-u6-l2')] }) },
  { id: 'aseo', build: (v) => ({ form: haeyo(v).slice(0, -1) + '서', chain: [end(`-${harmony(v)}서`, '«потому что» (причина-факт) или «и затем» (последовательность)', L.reason)] }) },
  { id: 'eodo', build: (v) => ({ form: haeyo(v).slice(0, -1) + '도', chain: [end(`-${harmony(v)}도`, '«даже если, хотя»; с 되다 — «можно»', 'g2-u7-l3')] }) },
  { id: 'eoya', build: (v) => ({ form: haeyo(v).slice(0, -1) + '야', chain: [end(`-${harmony(v)}야`, 'с 하다 / 되다 — «нужно, должен»', 'g2-u2-l2')] }) },
  {
    id: 'nikka',
    build: (v) => {
      const r = withEu(v, '니까');
      return { form: r.form, chain: [end(eu(r.eu, '니까'), '«так как, раз уж» — причина, после которой можно просить и предлагать', L.reason)] };
    },
  },
  {
    id: 'myeon',
    build: (v) => {
      const r = withEu(v, '면');
      return { form: r.form, chain: [end(eu(r.eu, '면'), '«если, когда»', 'g2-u3-l2')] };
    },
  },
  {
    id: 'reo',
    only: ['v'],
    build: (v) => {
      const r = withEu(v, '러');
      return { form: r.form, chain: [end(eu(r.eu, '러'), '«чтобы» — цель перед 가다 / 오다')] };
    },
  },
  {
    id: 'ryeogo',
    only: ['v'],
    build: (v) => {
      const r = withEu(v, '려고');
      return { form: r.form, chain: [end(eu(r.eu, '려고'), '«чтобы, собираясь»; с 하다 — «собираюсь»', 'g2-u4-l2')] };
    },
  },
  {
    id: 'myeonseo',
    build: (v) => {
      const r = withEu(v, '면서');
      return { form: r.form, chain: [end(eu(r.eu, '면서'), '«делая одно, делаю другое» — одновременно, один и тот же человек', 'g2-u6-l3')] };
    },
  },
  { id: 'pastAttrL', build: (v) => ({ form: pastStem(v) + '을', chain: [pastMark(v), end('-을', 'с 때 — «когда (в прошлом)»: 어렸을 때, 왔을 때', 'g2-u6-l1')] }) },
  {
    id: 'lgeyo',
    only: ['v'],
    build: (v) => {
      const r = withJamo(v, 'ㄹ', '게요');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄹ', '게요'), 'обещание или решение «я сделаю (для вас)»', 'g2-u9-l1')] };
    },
  },
  {
    id: 'llaeyo',
    only: ['v'],
    build: (v) => {
      const r = withJamo(v, 'ㄹ', '래요');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄹ', '래요'), '«хочу / буду» — выбор; в вопросе — «будешь?»', 'g2-u9-l2')] };
    },
  },
  {
    id: 'honLlaeyo',
    only: ['v'],
    build: (v) => {
      const r = withEu(v, '실래요');
      return { form: r.form, chain: [honor(r.eu), end('-ㄹ래요', 'вежливый вопрос «не хотите ли?»', 'g2-u9-l2')] };
    },
  },
  { id: 'gesseoyo', build: (v) => ({ form: v.slice(0, -1) + '겠어요', chain: [{ form: '-겠-', kind: 'tense', gloss: 'намерение или догадка «наверное»', lessonId: 'g2-u9-l2' }, end('-어요', 'вежливое окончание 해요체', L.haeyo)] }) },
  { id: 'gesseumnida', build: (v) => ({ form: v.slice(0, -1) + '겠습니다', chain: [{ form: '-겠-', kind: 'tense', gloss: 'намерение, вежливость (알겠습니다, 잘 먹겠습니다)', lessonId: 'g2-u9-l2' }, end('-습니다', 'официально-вежливое окончание', L.formal)] }) },
  { id: 'neunde', build: (v, pos) => (pos === 'a' && !/[있없]다$/.test(v) ? null : { form: withC(v, '는데'), chain: [end('-는데', 'фон, ситуация «…, а / и…»; мягкий контраст', 'g2-u10-l1')] }) },
  { id: 'neundeyo', build: (v, pos) => (pos === 'a' && !/[있없]다$/.test(v) ? null : { form: withC(v, '는데요'), chain: [end('-는데요', 'мягкое окончание: ждёт реакции собеседника', 'g2-u10-l1')] }) },
  {
    id: 'ndeA',
    only: ['a'],
    build: (v) => {
      if (/[있없]다$/.test(v)) return null;
      const r = withJamo(v, 'ㄴ', '데');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄴ', '데'), 'фон, ситуация «…, а / и…» (у прилагательных)', 'g2-u10-l1')] };
    },
  },
  {
    id: 'ndeAyo',
    only: ['a'],
    build: (v) => {
      if (/[있없]다$/.test(v)) return null;
      const r = withJamo(v, 'ㄴ', '데요');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄴ', '데요'), 'мягкое окончание: ждёт реакции собеседника', 'g2-u10-l1')] };
    },
  },
  { id: 'pastNeunde', build: (v) => ({ form: pastStem(v) + '는데', chain: [pastMark(v), end('-는데', 'фон «…, а / и…»', 'g2-u10-l1')] }) },
  // ---- 3급: 한다체, косвенная речь, предположение ----
  { id: 'handa', only: ['v'], build: (v) => { const f = neunda(v); return { form: f, chain: [end(f.endsWith('는다') ? '-는다' : '-ㄴ다', 'письменный стиль 한다체, настоящее время', 'g3-u1-l1')] }; } },
  { id: 'pastHanda', build: (v) => ({ form: pastStem(v) + '다', chain: [pastMark(v), end('-다', 'письменный стиль 한다체', 'g3-u1-l1')] }) },
  { id: 'dagoV', only: ['v'], build: (v) => ({ form: neunda(v) + '고', chain: [end(neunda(v).endsWith('는다') ? '-는다고' : '-ㄴ다고', 'передача чужих слов: «сказал, что…»', 'g3-u2-l1')] }) },
  { id: 'dagoA', only: ['a', 'aux'], build: (v) => ({ form: v + '고', chain: [end('-다고', 'передача чужих слов: «сказал, что…»', 'g3-u2-l1')] }) },
  { id: 'pastDago', build: (v) => ({ form: pastStem(v) + '다고', chain: [pastMark(v), end('-다고', 'передача чужих слов', 'g3-u2-l1')] }) },
  { id: 'daeyoV', only: ['v'], build: (v) => ({ form: neunda(v).slice(0, -1) + '대요', chain: [end(neunda(v).endsWith('는다') ? '-는대요' : '-ㄴ대요', '«говорят, что…» (сокращение от -ㄴ/는다고 해요)', 'g3-u2-l1')] }) },
  { id: 'daeyoA', only: ['a'], build: (v) => ({ form: v.slice(0, -1) + '대요', chain: [end('-대요', '«говорят, что…» (сокращение от -다고 해요)', 'g3-u2-l1')] }) },
  { id: 'pastDaeyo', build: (v) => ({ form: pastStem(v) + '대요', chain: [pastMark(v), end('-대요', '«говорят, что…»', 'g3-u2-l1')] }) },
  { id: 'nyago', build: (v) => ({ form: withC(v, '냐고'), chain: [end('-냐고', 'пересказ чужого вопроса', 'g3-u2-l2')] }) },
  { id: 'pastNyago', build: (v) => ({ form: pastStem(v) + '냐고', chain: [pastMark(v), end('-냐고', 'пересказ чужого вопроса', 'g3-u2-l2')] }) },
  {
    id: 'rago',
    only: ['v'],
    build: (v) => {
      const r = withEu(v, '라고');
      return { form: r.form, chain: [end(eu(r.eu, '라고'), 'пересказ просьбы или приказа', 'g3-u2-l2')] };
    },
  },
  {
    id: 'raeyo',
    only: ['v'],
    build: (v) => {
      const r = withEu(v, '래요');
      return { form: r.form, chain: [end(eu(r.eu, '래요'), '«велели / просят…» (сокращение от -(으)라고 해요)', 'g3-u2-l2')] };
    },
  },
  { id: 'jago', only: ['v'], build: (v) => ({ form: v.slice(0, -1) + '자고', chain: [end('-자고', 'пересказ предложения «давай…»', 'g3-u2-l2')] }) },
  { id: 'jaeyo', only: ['v'], build: (v) => ({ form: v.slice(0, -1) + '재요', chain: [end('-재요', '«предлагает…» (сокращение от -자고 해요)', 'g3-u2-l2')] }) },
  { id: 'na', build: (v, pos) => (pos === 'a' && !/[있없]다$/.test(v) ? null : { form: withC(v, '나'), chain: [end('-나', 'с 보다 — «видимо, судя по всему»', 'g3-u3-l2')] }) },
  { id: 'pastNa', build: (v) => ({ form: pastStem(v) + '나', chain: [pastMark(v), end('-나', 'с 보다 — «видимо»', 'g3-u3-l2')] }) },
  {
    id: 'ngA',
    only: ['a'],
    build: (v) => {
      if (/[있없]다$/.test(v)) return null;
      const r = withJamo(v, 'ㄴ', '가');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄴ', '가'), 'с 보다 — «видимо» (у прилагательных)', 'g3-u3-l2')] };
    },
  },
  // ---- 3급: изменения, номинализация, время 2 ----
  { id: 'ge', build: (v) => ({ form: v.slice(0, -1) + '게', chain: [end('-게', 'наречная форма «так, чтобы» (맛있게); с 되다 — «стало так, что»', 'g3-u4-l1')] }) },
  { id: 'eojyeoyo', build: (v) => ({ form: haeyo(v).slice(0, -1) + '져요', chain: [end(`-${harmony(v)}져요`, '«становится» (-아/어지다)', 'g3-u4-l2')] }) },
  { id: 'eojyeosseoyo', build: (v) => ({ form: haeyo(v).slice(0, -1) + '졌어요', chain: [end(`-${harmony(v)}지-`, '«стать» (-아/어지다)', 'g3-u4-l2'), { form: '-었-', kind: 'tense', gloss: 'прошедшее время', lessonId: L.past }, end('-어요', 'вежливое окончание', L.haeyo)] }) },
  { id: 'eum', build: (v) => { const f = eum(v); const j = decompose(lastSyl(v.slice(0, -1)))?.jong; return { form: f, chain: [end(j && j !== 'ㄹ' ? '-음' : '-ㅁ', 'существительное от глагола (-(으)ㅁ): письменный, «телеграфный» стиль', 'g3-u5-l2')] }; } },
  { id: 'jamaja', build: (v) => ({ form: v.slice(0, -1) + '자마자', chain: [end('-자마자', '«как только, сразу после»', 'g3-u6-l1')] }) },
  { id: 'daga', build: (v) => ({ form: v.slice(0, -1) + '다가', chain: [end('-다가', '«делал… и (прервался, переключился)»', 'g3-u6-l2')] }) },
  { id: 'pastDaga', build: (v) => ({ form: pastStem(v) + '다가', chain: [pastMark(v), end('-다가', '«сделал… и потом (обратное)»', 'g3-u6-l2')] }) },
  // ---- 3급: -더-, -던 ----
  { id: 'deoragoyo', build: (v) => ({ form: v.slice(0, -1) + '더라고요', chain: [end('-더라고요', '«я сам видел / почувствовал, и вот рассказываю»', 'g3-u8-l1')] }) },
  { id: 'pastDeoragoyo', build: (v) => ({ form: pastStem(v) + '더라고요', chain: [pastMark(v), end('-더라고요', '«оказывается, уже…» — наблюдал сам', 'g3-u8-l1')] }) },
  { id: 'deon', build: (v) => ({ form: v.slice(0, -1) + '던', chain: [end('-던', 'воспоминание: «который раньше (часто) делал» или незаконченное', 'g3-u8-l2')] }) },
  { id: 'pastDeon', build: (v) => ({ form: pastStem(v) + '던', chain: [pastMark(v), end('-던', 'воспоминание: «который когда-то сделал»', 'g3-u8-l2')] }) },
  // ---- 4급: уступка ----
  { id: 'deorado', build: (v) => ({ form: v.slice(0, -1) + '더라도', chain: [end('-더라도', '«даже если (вдруг)…» — предположение', 'g4-u1-l1')] }) },
  { id: 'pastDeorado', build: (v) => ({ form: pastStem(v) + '더라도', chain: [pastMark(v), end('-더라도', '«даже если (уже)…»', 'g4-u1-l1')] }) },
  {
    id: 'ljirado',
    build: (v) => {
      const r = withJamo(v, 'ㄹ', '지라도');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄹ', '지라도'), '«пусть даже…» — книжная, самая сильная уступка', 'g4-u1-l1')] };
    },
  },
  { id: 'neundedo', build: (v, pos) => (pos === 'a' && !/[있없]다$/.test(v) ? null : { form: withC(v, '는데도'), chain: [end('-는데도', '«хотя (на самом деле)…», результат неожиданный', 'g4-u1-l2')] }) },
  {
    id: 'ndedoA',
    only: ['a'],
    build: (v) => {
      if (/[있없]다$/.test(v)) return null;
      const r = withJamo(v, 'ㄴ', '데도');
      return { form: r.form, chain: [end(euJ(r.eu, 'ㄴ', '데도'), '«хотя (на самом деле)…» (у прилагательных)', 'g4-u1-l2')] };
    },
  },
  { id: 'pastNeundedo', build: (v) => ({ form: pastStem(v) + '는데도', chain: [pastMark(v), end('-는데도', '«хотя (уже) …», результат неожиданный', 'g4-u1-l2')] }) },
  // ---- 4급: противопоставление ----
  { id: 'gineun', build: (v) => ({ form: v.slice(0, -1) + '기는', chain: [end('-기는', '«-то да» — с 하지만: «вкусно-то вкусно, но…»', 'g4-u2-l2')] }) },
  { id: 'gin', build: (v) => ({ form: v.slice(0, -1) + '긴', chain: [end('-긴', 'сокращение от -기는: «-то да, но…»', 'g4-u2-l2')] }) },
  // ---- 4급: тонкие причины (바람에, 덕분에, 탓에 — существительные + 에, определение разбирается отдельно) ----
  { id: 'neurago', only: ['v'], build: (v) => ({ form: withC(v, '느라고'), chain: [end('-느라고', '«был занят тем, что… (и поэтому не смог)»', 'g4-u3-l1')] }) },
  { id: 'neura', only: ['v'], build: (v) => ({ form: withC(v, '느라'), chain: [end('-느라', 'сокращение от -느라고: «из-за того, что был занят…»', 'g4-u3-l1')] }) },
  { id: 'pastGi', build: (v) => ({ form: pastStem(v) + '기', chain: [pastMark(v), end('-기', 'с 때문에 — «потому что (уже случилось)»: 잤기 때문에', 'g2-u7-l2')] }) },
  { id: 'pastGo', build: (v) => ({ form: pastStem(v) + '고', chain: [pastMark(v), end('-고', '«и», «и затем»')] }) },
  { id: 'pastJiman', build: (v) => ({ form: pastStem(v) + '지만', chain: [pastMark(v), end('-지만', '«но, однако»')] }) },
  { id: 'pastNikka', build: (v) => ({ form: pastStem(v) + '으니까', chain: [pastMark(v), end('-으니까', '«так как, раз уж»', L.reason)] }) },
  { id: 'pastMyeon', build: (v) => ({ form: pastStem(v) + '으면', chain: [pastMark(v), end('-으면', '«если бы, если»')] }) },
  { id: 'pastNeyo', build: (v) => ({ form: pastStem(v) + '네요', chain: [pastMark(v), end('-네요', 'удивление: «оказывается…»', 'g2-u10-l2')] }) },
  { id: 'pastJyo', build: (v) => ({ form: pastStem(v) + '죠', chain: [pastMark(v), end('-죠', '«ведь…, правда?»')] }) },
];

const IRREG_NOTE: Record<string, string> = {
  ㅂ: 'ㅂ-нерегулярный: перед гласной ㅂ превращается в 우 (돕다 → 도와요, 춥다 → 추워요)',
  ㄷ: 'ㄷ-нерегулярный: перед гласной ㄷ превращается в ㄹ (듣다 → 들어요)',
  ㅅ: 'ㅅ-нерегулярный: перед гласной ㅅ выпадает (낫다 → 나아요)',
  ㅎ: 'ㅎ-нерегулярный: ㅎ выпадает (그렇다 → 그래요)',
  르: '르-нерегулярный: 르 → ㄹ라 / ㄹ러 (모르다 → 몰라요)',
  ㄹ: 'основа на ㄹ: ㄹ выпадает перед ㄴ, ㅂ, ㅅ (살다 → 사세요, 삽니다)',
  ㅡ: 'ㅡ выпадает перед -아/어 (쓰다 → 써요, 바쁘다 → 바빠요)',
};

const VERBAL: Pos[] = ['v', 'a', 'aux'];

/** Обратный индекс форм: поверхностная форма → разборы. */
export function buildVerbIndex(entries: DictEntry[]): Map<string, Analysis[]> {
  const idx = new Map<string, Analysis[]>();
  const add = (a: Analysis) => {
    const list = idx.get(a.surface) ?? [];
    if (!list.some((x) => x.lemma === a.lemma && x.chain.map((m) => m.form).join() === a.chain.map((m) => m.form).join())) list.push(a);
    idx.set(a.surface, list);
  };
  for (const e of entries) {
    if (!VERBAL.includes(e.pos) || !e.lemma.endsWith('다') || e.lemma.includes(' ')) continue;
    const it = irregularType(e.lemma);
    for (const t of T) {
      // Прилагательные на 있다/없다 (맛있다) образуют определение через -는, как глаголы.
      const allowed = t.only && t.id === 'attrPresent' && /[있없]다$/.test(e.lemma) ? true : !t.only || t.only.includes(e.pos);
      if (!allowed) continue;
      if (t.id === 'attrPast' && e.pos === 'a' && /[있없]다$/.test(e.lemma)) continue;
      let r: ReturnType<Template['build']>;
      try {
        r = t.build(e.lemma, e.pos);
      } catch {
        continue;
      }
      if (!r) continue;
      const stem = stemOf(e.lemma);
      const fused = !r.form.startsWith(stem);
      add({
        surface: r.form,
        lemma: e.lemma,
        pos: e.pos,
        entry: e,
        chain: [{ form: e.lemma, kind: 'stem', gloss: e.ru }, ...r.chain],
        note: fused && it && it !== '하다' ? IRREG_NOTE[it] : fused && it === '하다' ? '하다 + -여 сливается в 해' : undefined,
        score: 10 + (['haeyo', 'past', 'formal', 'seyo'].includes(t.id) ? 2 : 0),
      });
    }
  }
  return idx;
}

// ---------- Существительные и частицы ----------

interface Particle {
  form: string;
  after: 'C' | 'V' | 'any' | 'VL';
  gloss: string;
  kind?: MorphKind;
  lessonId?: string;
  pair?: string;
}

const P: Particle[] = [
  { form: '은', after: 'C', pair: '는', gloss: 'тема: «что касается…»; контраст', lessonId: 'g1-u1-l2' },
  { form: '는', after: 'V', pair: '은', gloss: 'тема: «что касается…»; контраст', lessonId: 'g1-u1-l2' },
  { form: '이', after: 'C', pair: '가', gloss: 'подлежащее; перед 아니다 и с 있다/없다', lessonId: 'g1-u2-l2' },
  { form: '가', after: 'V', pair: '이', gloss: 'подлежащее; перед 아니다 и с 있다/없다', lessonId: 'g1-u2-l2' },
  { form: '을', after: 'C', pair: '를', gloss: 'объект действия (винительный падеж)', lessonId: 'g1-u3-l2' },
  { form: '를', after: 'V', pair: '을', gloss: 'объект действия (винительный падеж)', lessonId: 'g1-u3-l2' },
  { form: '에서', after: 'any', gloss: 'место действия «в, на»; «из, от»', lessonId: 'g1-u3-l3' },
  { form: '에게', after: 'any', gloss: '«кому» (адресат)' },
  { form: '한테', after: 'any', gloss: '«кому» (разговорное)' },
  { form: '께서', after: 'any', gloss: 'подлежащее (почтительно)' },
  { form: '께', after: 'any', gloss: '«кому» (почтительно)' },
  { form: '에', after: 'any', gloss: '«в, на, к» — направление, местонахождение, время', lessonId: 'g1-u3-l3' },
  { form: '의', after: 'any', gloss: 'принадлежность «чей» (читается [에])', lessonId: 'g1-u2-l3' },
  { form: '도', after: 'any', gloss: '«тоже, и; даже»', lessonId: 'g1-u6-l2' },
  { form: '과', after: 'C', pair: '와', gloss: '«и; с» (письменное)' },
  { form: '와', after: 'V', pair: '과', gloss: '«и; с» (письменное)' },
  { form: '하고', after: 'any', gloss: '«и; вместе с» (разговорное)', lessonId: 'g1-u6-l2' },
  { form: '부터', after: 'any', gloss: '«с, от» (начало)', lessonId: 'g1-u10-l2' },
  { form: '까지', after: 'any', gloss: '«до» (предел)', lessonId: 'g1-u10-l2' },
  { form: '으로', after: 'C', pair: '로', gloss: '«в, на» (направление); «с помощью, на» (средство)' },
  { form: '로', after: 'VL', pair: '으로', gloss: '«в, на» (направление); «с помощью, на» (средство)' },
  { form: '만', after: 'any', gloss: '«только»' },
  { form: '보다', after: 'any', gloss: '«чем» (сравнение)' },
  { form: '들', after: 'any', gloss: 'множественное число' },
  { form: '요', after: 'any', gloss: 'вежливость в неполной фразе: 저는요? «а я?»', lessonId: 'g1-u6-l2' },
  { form: '이에요', after: 'C', pair: '예요', kind: 'copula', gloss: '«является» — связка 해요체', lessonId: L.copula },
  { form: '예요', after: 'V', pair: '이에요', kind: 'copula', gloss: '«является» — связка 해요체', lessonId: L.copula },
  { form: '이었어요', after: 'C', pair: '였어요', kind: 'copula', gloss: '«был, являлся»', lessonId: L.past },
  { form: '였어요', after: 'V', pair: '이었어요', kind: 'copula', gloss: '«был, являлся»', lessonId: L.past },
  { form: '입니다', after: 'any', kind: 'copula', gloss: '«является» — связка 합니다체', lessonId: L.formal },
  { form: '이다', after: 'C', kind: 'copula', gloss: '«является» — связка в словарной форме и в 한다체', lessonId: 'g3-u1-l1' },
  { form: '이었다', after: 'C', pair: '였다', kind: 'copula', gloss: '«был» — 한다체', lessonId: 'g3-u1-l1' },
  { form: '였다', after: 'V', pair: '이었다', kind: 'copula', gloss: '«был» — 한다체', lessonId: 'g3-u1-l1' },
  { form: '이라고', after: 'C', pair: '라고', kind: 'copula', gloss: 'пересказ: «сказал, что (это) …»', lessonId: 'g3-u2-l1' },
  { form: '라고', after: 'V', pair: '이라고', kind: 'copula', gloss: 'пересказ: «сказал, что (это) …»', lessonId: 'g3-u2-l1' },
  { form: '이래요', after: 'C', pair: '래요', kind: 'copula', gloss: '«говорят, что (это) …»', lessonId: 'g3-u2-l1' },
  { form: '입니까', after: 'any', kind: 'copula', gloss: '«является?» — вопрос 합니다체', lessonId: L.formal },
  { form: '이었습니다', after: 'C', pair: '였습니다', kind: 'copula', gloss: '«был» — 합니다체', lessonId: L.formal },
  { form: '였습니다', after: 'V', pair: '이었습니다', kind: 'copula', gloss: '«был» — 합니다체', lessonId: L.formal },
  { form: '이고', after: 'C', kind: 'copula', gloss: '«является, и…»' },
  { form: '이지만', after: 'C', kind: 'copula', gloss: '«является, но…»' },
];
/** Что может стоять второй частицей: 에서는, 에도, 에서도, 까지만… */
const SECOND = new Set(['은', '는', '도', '의', '만', '요', '이에요', '예요']);

function agrees(noun: string, p: Particle): boolean {
  const s = decompose(lastSyl(noun));
  if (!s) return true; // цифры, латиница
  if (p.after === 'C') return !!s.jong && !(p.form === '으로' && s.jong === 'ㄹ');
  if (p.after === 'V') return !s.jong;
  if (p.after === 'VL') return !s.jong || s.jong === 'ㄹ';
  return true;
}

/** Стяжённые формы местоимений. */
const SPECIAL: Record<string, { lemma: string; parts: Morph[]; note: string }> = {
  제가: { lemma: '저', parts: [{ form: '가', kind: 'particle', gloss: 'подлежащее', lessonId: 'g1-u2-l2' }], note: 'Перед 가 저 превращается в 제: 저 + 가 → 제가' },
  내가: { lemma: '나', parts: [{ form: '가', kind: 'particle', gloss: 'подлежащее' }], note: 'Перед 가 나 превращается в 내: 나 + 가 → 내가' },
  제: { lemma: '저', parts: [{ form: '의', kind: 'particle', gloss: 'принадлежность: «мой»', lessonId: 'g1-u2-l3' }], note: '저 + 의 → 제 «мой»' },
  내: { lemma: '나', parts: [{ form: '의', kind: 'particle', gloss: 'принадлежность: «мой»' }], note: '나 + 의 → 내 «мой»' },
  누가: { lemma: '누구', parts: [{ form: '가', kind: 'particle', gloss: 'подлежащее' }], note: 'Перед 가 누구 сокращается: 누구 + 가 → 누가' },
  뭘: { lemma: '뭐', parts: [{ form: '를', kind: 'particle', gloss: 'объект действия' }], note: '뭐 + 를 → 뭘' },
  이걸: { lemma: '이거', parts: [{ form: '를', kind: 'particle', gloss: 'объект действия' }], note: '이거 + 를 → 이걸' },
  그걸: { lemma: '그거', parts: [{ form: '를', kind: 'particle', gloss: 'объект действия' }], note: '그거 + 를 → 그걸' },
  이건: { lemma: '이거', parts: [{ form: '는', kind: 'particle', gloss: 'тема' }], note: '이거 + 는 → 이건' },
  그건: { lemma: '그거', parts: [{ form: '는', kind: 'particle', gloss: 'тема' }], note: '그거 + 는 → 그건' },
  이게: { lemma: '이거', parts: [{ form: '가', kind: 'particle', gloss: 'подлежащее' }], note: '이거 + 가(이) → 이게' },
  그게: { lemma: '그거', parts: [{ form: '가', kind: 'particle', gloss: 'подлежащее' }], note: '그거 + 가(이) → 그게' },
  거예요: { lemma: '것', parts: [{ form: '예요', kind: 'copula', gloss: '«является»', lessonId: L.copula }], note: '거 = 것. После -(으)ㄹ: «буду делать» — 갈 거예요', },
  겁니다: { lemma: '것', parts: [{ form: '입니다', kind: 'copula', gloss: '«является» (합니다체)', lessonId: L.formal }], note: '것 + 입니다 → 겁니다. После -(으)ㄹ: «буду делать»' },
};

const NOMINAL: Pos[] = ['n', 'pron', 'num', 'cnt'];

export function analyzeNoun(token: string, lookup: (lemma: string) => DictEntry | undefined): Analysis[] {
  const out: Analysis[] = [];
  const sp = SPECIAL[token];
  if (sp) {
    const e = lookup(sp.lemma);
    out.push({ surface: token, lemma: sp.lemma, pos: e?.pos ?? 'pron', entry: e, chain: [{ form: sp.lemma, kind: 'stem', gloss: e?.ru ?? '' }, ...sp.parts], note: sp.note, score: 14 });
  }
  for (let i = token.length - 1; i >= 1; i--) {
    const noun = token.slice(0, i);
    const rest = token.slice(i);
    for (const seq of particleSeqs(rest)) {
      const e = lookup(noun);
      if (e && !NOMINAL.includes(e.pos)) continue;
      const first = seq[0];
      const ok = agrees(noun, first);
      const pair = first.pair ? P.find((p) => p.form === first.pair) : undefined;
      const fix = !ok && pair ? noun + pair.form + seq.slice(1).map((p) => p.form).join('') : undefined;
      out.push({
        surface: token,
        lemma: noun,
        pos: e?.pos ?? '?',
        entry: e,
        chain: [{ form: noun, kind: 'stem', gloss: e?.ru ?? 'нет в учебном словаре' }, ...seq.map((p) => ({ form: p.form, kind: p.kind ?? 'particle', gloss: p.gloss, lessonId: p.lessonId }))],
        warning: !ok ? (fix ? `После ${decompose(lastSyl(noun))?.jong ? 'согласной' : 'гласной'} нужно «${pair!.form}»: ${fix}` : undefined) : undefined,
        // Для неизвестных основ предпочитаем разбор, который объясняет больше букв частицами (안나 + 예요, а не 안나예 + 요).
        score: (e ? 9 : 1 + rest.length * 0.5) + (ok ? 2 : -4) - seq.length,
      });
    }
  }
  return out;
}

function particleSeqs(rest: string): Particle[][] {
  const res: Particle[][] = [];
  for (const p of P) {
    if (rest === p.form) res.push([p]);
    else if (rest.startsWith(p.form)) {
      const tail = rest.slice(p.form.length);
      for (const q of P) if (SECOND.has(q.form) && tail === q.form && agreesAfterParticle(p.form, q)) res.push([p, q]);
    }
  }
  return res;
}

function agreesAfterParticle(prev: string, q: Particle): boolean {
  const j = hasJong(lastSyl(prev));
  if (q.after === 'C') return j;
  if (q.after === 'V') return !j;
  return true;
}

const PARADIGM: [id: string, label: string][] = [
  ['haeyo', 'Настоящее (해요)'],
  ['past', 'Прошедшее'],
  ['formal', 'Официально (합니다)'],
  ['seyo', 'Просьба -(으)세요'],
  ['attrFuture', 'Будущее (+ 거예요)'],
  ['lkkayo', 'Давайте? -(으)ㄹ까요'],
  ['go', '-고 (и; + 싶어요)'],
  ['ji', '-지 (+ 않아요)'],
  ['aseo', '-아/어서 (потому что)'],
  ['nikka', '-(으)니까 (раз уж)'],
  ['myeon', '-(으)면 (если)'],
  ['attrPresent', 'Определение: настоящее'],
  ['attrPast', 'Определение: -(으)ㄴ'],
];

/** Таблица форм для статьи словаря. */
export function paradigm(lemma: string, pos: Pos): { label: string; form: string }[] {
  if (!VERBAL.includes(pos) || !lemma.endsWith('다')) return [];
  const out: { label: string; form: string }[] = [];
  for (const [id, label] of PARADIGM) {
    const t = T.find((x) => x.id === id)!;
    if (t.only && !t.only.includes(pos)) continue;
    if (pos === 'a' && (id === 'seyo' || id === 'lkkayo')) continue;
    try {
      const r = t.build(lemma, pos);
      if (r) out.push({ label: id === 'attrPast' && pos !== 'v' ? 'Определение (какой)' : label, form: id === 'attrFuture' ? `${r.form} 거예요` : id === 'go' && pos !== 'a' ? `${r.form} 싶어요` : id === 'ji' ? `${r.form} 않아요` : r.form });
    } catch {
      /* форма не строится — пропускаем */
    }
  }
  return out;
}
