// Спряжение в стиле 해요체 (настоящее время, -아/어요).
// Правило гармонии: если последний слог основы содержит ㅏ или ㅗ — -아요, иначе -어요; 하다 → 해요.
import { compose, decompose } from './hangul';

/** Нерегулярные основы (без 다). Остальные с тем же патчимом спрягаются регулярно. */
const IRREGULAR_B = new Set(['돕', '덥', '춥', '어둡', '시끄럽', '부드럽', '더럽', '쉽', '어렵', '맵', '가깝', '귀엽', '무섭', '뜨겁', '차갑', '반갑', '즐겁', '아름답', '고맙', '가볍', '무겁', '눕', '굽', '미끄럽']);
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
  | 'attrV' | 'attrA' | 'attrPast' | 'attrFut'
  // время: когда, когда (в прошлом), перед, после, одновременно, пока
  | 'ttae' | 'pastTtae' | 'jeone' | 'hue' | 'myeonseo' | 'dongan'
  // причины и разрешения
  | 'aseo' | 'gittaemune' | 'pastGittaemune' | 'eodo' | 'myeonan'
  // почтительность
  | 'honPresent' | 'honPast' | 'honFormal'
  // обещания и выбор
  | 'lgeyo' | 'llaeyo' | 'gesseoyo'
  // живая речь
  | 'neundeV' | 'neundeA' | 'pastNeunde' | 'neyo' | 'pastNeyo' | 'jyo'
  // 3급: письменный стиль 한다체
  | 'handaV' | 'handaPast' | 'handaFut'
  // косвенная речь
  | 'indV' | 'indA' | 'indPast' | 'daeyoV' | 'daeyoA' | 'indQ' | 'indCmd' | 'indSug'
  // предположение
  | 'gotgataV' | 'gotgataPast' | 'gotgataFut' | 'gotgataA' | 'nabwayo' | 'pastNabwayo' | 'ngabwayo'
  // изменения, номинализация, время 2
  | 'gedwae' | 'eojida' | 'neungeot' | 'eum' | 'giwihae' | 'jamaja' | 'daga' | 'pastDaga'
  // каузатив -게 하다, воспоминание -더-
  | 'gehada' | 'deoragoyo' | 'pastDeoragoyo' | 'deon' | 'pastDeon'
  // 4급: уступка
  | 'ado' | 'deorado' | 'ljirado' | 'neundedoV' | 'neundedoA' | 'pastNeundedo'
  // противопоставление
  | 'banmyeonV' | 'banmyeonA' | 'pastBanmyeon' | 'debanhaeV' | 'debanhaeA' | 'gineun' | 'pastGineun'
  // тонкие причины
  | 'barame' | 'neurago' | 'deokbun' | 'deokbunA' | 'tatPast' | 'tatA'
  // гипотеза и сожаление
  | 'deoramyeon' | 'lppeon' | 'ndamyeonV' | 'damyeonA' | 'pastDamyeon'
  // синонимичные пары: -거든요/-잖아요, -(으)ㄹ 텐데/건데, -더니/-았/었더니
  | 'geodeunyo' | 'pastGeodeunyo' | 'janayo' | 'pastJanayo' | 'ltende' | 'lgeonde' | 'deoni' | 'pastDeoni'
  // цель 2 и степень
  | 'dorok' | 'goja' | 'lgyeom' | 'ljeongdoro' | 'lsurok' | 'giman' | 'gimanhaeyo'
  // дополнение по Korean Grammar in Use — 1급
  | 'go' | 'juseyo' | 'jimaseyo'
  // 2급
  | 'gonaseo' | 'geona' | 'ljulalda' | 'jianhado' | 'eosseumyeon' | 'ryeomyeon' | 'lkkahada' | 'nji' | 'jungida'
  | 'geoeottaeyo' | 'gunyoV' | 'gunyoA' | 'boyeoyo' | 'geAdv' | 'ahada'
  // 3급
  | 'aitda' | 'anota' | 'abeorida' | 'gomalda' | 'ljido' | 'lkkabwa' | 'neundaero' | 'gonhada' | 'pyeonV' | 'pyeonA'
  | 'lmanhada' | 'cheok' | 'raeyo' | 'jaeyo' | 'nyaeyo'
  // 4급
  | 'deunji' | 'abwatja' | 'lppunman' | 'dedagaV' | 'dedagaA' | 'gillae' | 'aseogeureonji' | 'ltenikka' | 'lgeolgeuraetda'
  | 'lliga' | 'ayajiyo' | 'lgeolyo' | 'gineunyo' | 'deondeyo' | 'dabomyeon' | 'nchaero' | 'ryeodeon'
  // 5급: книжные конструкции (письменный стиль, формы на -다)
  | 'gimaryeon' | 'lsubakke' | 'gisipsang' | 'lbeophada' | 'eumettara' | 'neunhan' | 'nisang' | 'eumeuro' | 'gie' | 'eumeurosseo'
  | 'neuni' | 'lbaeya' | 'geon' | 'dagibodaV' | 'dagibodaA' | 'gineunkeonyeong' | 'lmangjeong' | 'nsem' | 'ginareum' | 'lttareum'
  | 'dasipi' | 'nbawa' | 'deusi' | 'deutV' | 'deutA'
  // 6급: редкие книжные и литературные окончания, 하오체 и 하게체, академический стиль
  | 'namana' | 'giemangjeong' | 'geoniwa' | 'pastGeoniwa' | 'ljindae' | 'nora' | 'pastNora' | 'lira' | 'doda' | 'ljieoda'
  | 'hao' | 'pastHao' | 'hasio' | 'hageSt' | 'hageQ' | 'hageCmd' | 'hageSug' | 'deoniman' | 'eumedo' | 'pastEumedo'
  | 'dagoV' | 'dagoA' | 'lgeoseuro';

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
    case 'ttae':
      return `${withL(verb)} 때`;
    case 'pastTtae':
      return `${pastStemOf(verb)}을 때`;
    case 'jeone':
      return `${stem}기 전에`;
    case 'hue':
      return `${withN(verb)} 후에`;
    case 'myeonseo':
      return `${euKeepL(verb)}면서`;
    case 'dongan':
      return `${withNeun(verb)} 동안`;
    case 'aseo':
      return `${info(verb)}서`;
    case 'gittaemune':
      return `${stem}기 때문에`;
    case 'pastGittaemune':
      return `${pastStemOf(verb)}기 때문에`;
    case 'eodo':
      return `${info(verb)}도 돼요`;
    case 'myeonan':
      return `${euKeepL(verb)}면 안 돼요`;
    case 'honPresent':
      return `${stemForEu(verb, 'ㅅ').base}세요`;
    case 'honPast':
      return `${stemForEu(verb, 'ㅅ').base}셨어요`;
    case 'honFormal':
      return `${stemForEu(verb, 'ㅅ').base}십니다`;
    case 'lgeyo':
      return `${withL(verb)}게요`;
    case 'llaeyo':
      return `${withL(verb)}래요`;
    case 'gesseoyo':
      return `${stem}겠어요`;
    case 'neundeV':
      return `${withNeun(verb)}데`;
    case 'neundeA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)}데`;
    case 'pastNeunde':
      return `${pastStemOf(verb)}는데`;
    case 'neyo':
      return `${s.jong === 'ㄹ' ? replaceLast(stem, compose(s.cho, s.jung)!) : stem}네요`;
    case 'pastNeyo':
      return `${pastStemOf(verb)}네요`;
    case 'jyo':
      return `${stem}죠`;
    case 'handaV':
      return neunda(verb);
    case 'handaPast':
      return `${pastStemOf(verb)}다`;
    case 'handaFut':
      return `${withL(verb)} 것이다`;
    case 'indV':
      return `${neunda(verb)}고 했어요`;
    case 'indA':
      return `${verb}고 했어요`;
    case 'indPast':
      return `${pastStemOf(verb)}다고 했어요`;
    case 'daeyoV':
      return `${neunda(verb).slice(0, -1)}대요`;
    case 'daeyoA':
      return `${stem}대요`;
    case 'indQ':
      return `${dropL(verb)}냐고 했어요`;
    case 'indCmd':
      return `${euKeepL(verb)}라고 했어요`;
    case 'indSug':
      return `${stem}자고 했어요`;
    case 'gotgataV':
      return `${withNeun(verb)} 것 같아요`;
    case 'gotgataPast':
      return `${withN(verb)} 것 같아요`;
    case 'gotgataFut':
      return `${withL(verb)} 것 같아요`;
    case 'gotgataA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)} 것 같아요`;
    case 'nabwayo':
      return `${dropL(verb)}나 봐요`;
    case 'pastNabwayo':
      return `${pastStemOf(verb)}나 봐요`;
    case 'ngabwayo':
      return `${withN(verb)}가 봐요`;
    case 'gedwae':
      return `${stem}게 됐어요`;
    case 'eojida':
      return `${info(verb)}졌어요`;
    case 'neungeot':
      return `${withNeun(verb)} 것`;
    case 'eum':
      return eum(verb);
    case 'giwihae':
      return `${stem}기 위해서`;
    case 'jamaja':
      return `${stem}자마자`;
    case 'daga':
      return `${stem}다가`;
    case 'pastDaga':
      return `${pastStemOf(verb)}다가`;
    case 'gehada':
      return `${stem}게 했어요`;
    case 'deoragoyo':
      return `${stem}더라고요`;
    case 'pastDeoragoyo':
      return `${pastStemOf(verb)}더라고요`;
    case 'deon':
      return `${stem}던`;
    case 'pastDeon':
      return `${pastStemOf(verb)}던`;
    case 'ado':
      return `${info(verb)}도`;
    case 'deorado':
      return `${stem}더라도`;
    case 'ljirado':
      return `${withL(verb)}지라도`;
    case 'neundedoV':
      return `${withNeun(verb)}데도`;
    case 'neundedoA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)}데도`;
    case 'pastNeundedo':
      return `${pastStemOf(verb)}는데도`;
    case 'banmyeonV':
      return `${withNeun(verb)} 반면에`;
    case 'banmyeonA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)} 반면에`;
    case 'pastBanmyeon':
      return `${withN(verb)} 반면에`;
    case 'debanhaeV':
      return `${withNeun(verb)}데 반해`;
    case 'debanhaeA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)}데 반해`;
    case 'gineun':
      return `${stem}기는 하지만`;
    case 'pastGineun':
      return `${stem}기는 했지만`;
    case 'barame':
      return `${withNeun(verb)} 바람에`;
    case 'neurago':
      return `${dropL(verb)}느라고`;
    case 'deokbun':
    case 'tatPast':
      return `${withN(verb)} ${form === 'deokbun' ? '덕분에' : '탓에'}`;
    case 'deokbunA':
    case 'tatA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)} ${form === 'deokbunA' ? '덕분에' : '탓에'}`;
    case 'deoramyeon':
      return `${pastStemOf(verb)}더라면`;
    case 'lppeon':
      return `${withL(verb)} 뻔했어요`;
    case 'ndamyeonV':
      return `${neunda(verb)}면`;
    case 'damyeonA':
      return `${verb}면`;
    case 'pastDamyeon':
      return `${pastStemOf(verb)}다면`;
    case 'geodeunyo':
      return `${stem}거든요`;
    case 'pastGeodeunyo':
      return `${pastStemOf(verb)}거든요`;
    case 'janayo':
      return `${stem}잖아요`;
    case 'pastJanayo':
      return `${pastStemOf(verb)}잖아요`;
    case 'ltende':
      return `${withL(verb)} 텐데`;
    case 'lgeonde':
      return `${withL(verb)} 건데`;
    case 'deoni':
      return `${stem}더니`;
    case 'pastDeoni':
      return `${pastStemOf(verb)}더니`;
    case 'dorok':
      return `${stem}도록`;
    case 'goja':
      return `${stem}고자`;
    case 'lgyeom':
      return `${withL(verb)} 겸`;
    case 'ljeongdoro':
      return `${withL(verb)} 정도로`;
    case 'lsurok':
      return `${withL(verb)}수록`;
    case 'giman':
      return `${stem}기만 하면`;
    case 'gimanhaeyo':
      return `${stem}기만 해요`;
    case 'go':
      return `${stem}고`;
    case 'juseyo':
      return `${info(verb)} 주세요`;
    case 'jimaseyo':
      return `${stem}지 마세요`;
    case 'gonaseo':
      return `${stem}고 나서`;
    case 'geona':
      return `${stem}거나`;
    case 'ljulalda':
      return `${withL(verb)} 줄 알아요`;
    case 'jianhado':
      return `${stem}지 않아도 돼요`;
    case 'eosseumyeon':
      return `${pastStemOf(verb)}으면 좋겠어요`;
    case 'ryeomyeon':
      return `${euKeepL(verb)}려면`;
    case 'lkkahada':
      return `${withL(verb)}까 해요`;
    case 'nji':
      return `${withN(verb)} 지`;
    case 'jungida':
      return `${withNeun(verb)} 중이에요`;
    case 'geoeottaeyo':
      return `${withNeun(verb)} 게 어때요`;
    case 'gunyoV':
      return `${withNeun(verb)}군요`;
    case 'gunyoA':
      return `${stem}군요`;
    case 'boyeoyo':
      return `${info(verb)} 보여요`;
    case 'geAdv':
      return `${stem}게`;
    case 'ahada':
      return `${info(verb)}해요`;
    case 'aitda':
      return `${info(verb)} 있어요`;
    case 'anota':
      return `${info(verb)} 놓았어요`;
    case 'abeorida':
      return `${info(verb)} 버렸어요`;
    case 'gomalda':
      return `${stem}고 말았어요`;
    case 'ljido':
      return `${withL(verb)}지도 몰라요`;
    case 'lkkabwa':
      return `${withL(verb)}까 봐`;
    case 'neundaero':
      return `${withNeun(verb)} 대로`;
    case 'gonhada':
      return `${stem}곤 했어요`;
    case 'pyeonV':
      return `${withNeun(verb)} 편이에요`;
    case 'pyeonA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)} 편이에요`;
    case 'lmanhada':
      return `${withL(verb)} 만해요`;
    case 'cheok':
      return `${withNeun(verb)} 척했어요`;
    case 'raeyo':
      return `${euKeepL(verb)}래요`;
    case 'jaeyo':
      return `${stem}재요`;
    case 'nyaeyo':
      return `${dropL(verb)}냬요`;
    case 'deunji':
      return `${stem}든지`;
    case 'abwatja':
      return `${info(verb)} 봤자`;
    case 'lppunman':
      return `${withL(verb)} 뿐만 아니라`;
    case 'dedagaV':
      return `${withNeun(verb)} 데다가`;
    case 'dedagaA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)} 데다가`;
    case 'gillae':
      return `${stem}길래`;
    case 'aseogeureonji':
      return `${info(verb)}서 그런지`;
    case 'ltenikka':
      return `${withL(verb)} 테니까`;
    case 'lgeolgeuraetda':
      return `${withL(verb)} 걸 그랬어요`;
    case 'lliga':
      return `${withL(verb)} 리가 없어요`;
    case 'ayajiyo':
      return `${info(verb)}야지요`;
    case 'lgeolyo':
      return `${withL(verb)}걸요`;
    case 'gineunyo':
      return `${stem}기는요`;
    case 'deondeyo':
      return `${stem}던데요`;
    case 'dabomyeon':
      return `${stem}다 보면`;
    case 'nchaero':
      return `${withN(verb)} 채로`;
    case 'ryeodeon':
      return `${euKeepL(verb)}려던 참이에요`;
    case 'gimaryeon':
      return `${stem}기 마련이다`;
    case 'lsubakke':
      return `${withL(verb)} 수밖에 없다`;
    case 'gisipsang':
      return `${stem}기 십상이다`;
    case 'lbeophada':
      return `${withL(verb)} 법하다`;
    case 'eumettara':
      return `${eum(verb)}에 따라`;
    case 'neunhan':
      return `${withNeun(verb)} 한`;
    case 'nisang':
      return `${withN(verb)} 이상`;
    case 'eumeuro':
      return `${euKeepL(verb)}므로`;
    case 'gie':
      return `${stem}기에`;
    case 'eumeurosseo':
      return `${eum(verb)}으로써`;
    case 'neuni':
      return `${dropL(verb)}느니`;
    case 'lbaeya':
      return `${withL(verb)} 바에야`;
    case 'geon':
      return `${stem}건`;
    case 'dagibodaV':
      return `${neunda(verb)}기보다는`;
    case 'dagibodaA':
      return `${verb}기보다는`;
    case 'gineunkeonyeong':
      return `${stem}기는커녕`;
    case 'lmangjeong':
      return `${withL(verb)}망정`;
    case 'nsem':
      return `${withN(verb)} 셈이다`;
    case 'ginareum':
      return `${stem}기 나름이다`;
    case 'lttareum':
      return `${withL(verb)} 따름이다`;
    case 'dasipi':
      return `${stem}다시피`;
    case 'nbawa':
      return `${withN(verb)} 바와 같이`;
    case 'deusi':
      return `${stem}듯이`;
    case 'deutV':
      return `${withNeun(verb)} 듯하다`;
    case 'deutA':
      return `${takesNeun(verb) ? withNeun(verb) : withN(verb)} 듯하다`;
    // ---- 6급 ----
    case 'namana':
      return `${stemForEu(verb, 'ㅅ').base}나 마나`;
    case 'giemangjeong':
      return `${pastStemOf(verb)}기에 망정이지`;
    case 'geoniwa':
      return `${stem}거니와`;
    case 'pastGeoniwa':
      return `${pastStemOf(verb)}거니와`;
    case 'ljindae':
      return `${withL(verb)}진대`;
    case 'nora':
      return `${dropL(verb)}노라`;
    case 'pastNora':
      return `${pastStemOf(verb)}노라`;
    case 'lira':
      return `${euKeepL(verb)}리라`;
    case 'doda':
      return verb === '이다' ? '이로다' : `${stem}도다`;
    case 'ljieoda':
      return `${withL(verb)}지어다`;
    case 'hao':
      // 하오체: после гласной и ㄹ (выпадает) — -오, после согласной — -소: 가오, 사오, 먹소. 이다 → 이오.
      if (verb === '이다') return '이오';
      return s.jong && s.jong !== 'ㄹ' ? `${stem}소` : `${dropL(verb)}오`;
    case 'pastHao':
      return `${pastStemOf(verb)}소`;
    case 'hasio':
      return `${stemForEu(verb, 'ㅅ').base}시오`;
    case 'hageSt':
      return `${dropL(verb)}네`;
    case 'hageQ':
      return `${dropL(verb)}나`;
    case 'hageCmd':
      return `${stem}게`;
    case 'hageSug':
      return `${dropL(verb)}세`;
    case 'deoniman':
      return `${stem}더니만`;
    case 'eumedo':
      return `${eum(verb)}에도 불구하고`;
    case 'pastEumedo':
      return `${pastStemOf(verb)}음에도 불구하고`;
    case 'dagoV':
      return `${neunda(verb)}고 볼 수 있다`;
    case 'dagoA':
      return `${verb}고 볼 수 있다`;
    case 'lgeoseuro':
      return `${withL(verb)} 것으로 보인다`;
  }
}

/** 한다체 глагола: 가다 → 간다, 살다 → 산다, 먹다 → 먹는다, 듣다 → 듣는다. */
export function neunda(verb: string): string {
  const stem = stemOf(verb);
  const s = decompose(stem[stem.length - 1])!;
  if (s.jong && s.jong !== 'ㄹ') return `${stem}는다`;
  return replaceLast(stem, compose(s.cho, s.jung, 'ㄴ')!) + '다';
}

/** Номинализация -(으)ㅁ: 가다 → 감, 먹다 → 먹음, 살다 → 삶, 만들다 → 만듦, 돕다 → 도움, 듣다 → 들음. */
export function eum(verb: string): string {
  const stem = stemOf(verb);
  const s = decompose(stem[stem.length - 1])!;
  if (s.jong === 'ㄹ') return replaceLast(stem, compose(s.cho, s.jung, 'ㄻ')!);
  const { base } = stemForEu(verb, 'ㄹ');
  return replaceLast(base, addJong(base[base.length - 1], 'ㅁ'));
}

/** Основа без ㄹ (перед ㄴ, ㅅ): 살 → 사. */
function dropL(verb: string): string {
  const stem = stemOf(verb);
  const s = decompose(stem[stem.length - 1])!;
  return s.jong === 'ㄹ' ? replaceLast(stem, compose(s.cho, s.jung)!) : stem;
}

/** Основа прошедшего времени: 가다 → 갔, 먹다 → 먹었. */
function pastStemOf(verb: string): string {
  return conj(verb, 'past').slice(0, -2);
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
    case 'ttae':
      // Не используем -(으)ㄴ 때: у прилагательных «추운 때» («холодная пора») допустимо.
      c = [vowel ? `${stem}을 때` : `${stem} 때`, `${stem}기 때`, s.jong === 'ㄹ' ? `${stem}는 때` : `${withNeun(verb)} 때`];
      break;
    case 'pastTtae': {
      // Неверная гармония (어리았을, 오었을); несокращённое 어리었을 допустимо, поэтому его не берём.
      const raw = `${stem}${isBright(s.jung) ? '었' : '았'}을 때`;
      c = [`${pastStemOf(verb)}는 때`, raw, `${haeyo(verb)} 때`];
      break;
    }
    case 'jeone':
      c = [`${withNeun(verb)} 전에`, `${withN(verb)} 전에`, `${stem}기 후에`];
      break;
    case 'hue':
      c = [`${stem}기 후에`, `${withNeun(verb)} 후에`, `${withL(verb)} 후에`];
      break;
    case 'myeonseo':
      c = [vowel ? `${stem}으면서` : `${stem}면서`, `${info(verb)}면서`];
      break;
    case 'dongan':
      c = [`${stem}기 동안`, `${withL(verb)} 동안`];
      break;
    case 'aseo': {
      // Классическая ошибка — прошедшее перед -아/어서 (갔어서) и неверная гармония.
      const wrong = `${stem}${isBright(s.jung) ? '어' : '아'}서`;
      c = [`${pastStemOf(verb)}어서`, wrong, `${stem}서`];
      break;
    }
    case 'gittaemune':
      c = [`${withNeun(verb)} 때문에`, `${withN(verb)} 때문에`];
      break;
    case 'pastGittaemune':
      c = [`${pastStemOf(verb)}는 때문에`, `${stem}${isBright(s.jung) ? '었' : '았'}기 때문에`];
      break;
    case 'eodo':
      // Не берём «-(으)면 돼요» — это грамматично («достаточно…»).
      c = [`${stem}${isBright(s.jung) ? '어' : '아'}도 돼요`, `${stem}도 돼요`, `${withN(verb)}도 돼요`];
      break;
    case 'honPresent':
    case 'honPast':
    case 'honFormal': {
      const tail = form === 'honPresent' ? '세요' : form === 'honPast' ? '셨어요' : '십니다';
      const plain = form === 'honPresent' ? haeyo(verb) : form === 'honPast' ? conj(verb, 'past') : conj(verb, 'formal');
      c = [vowel ? `${stem}으${tail}` : `${stem}${tail}`, plain];
      break;
    }
    case 'lgeyo':
      // Самая частая орфографическая ошибка: 갈께요 вместо 갈게요.
      c = [`${withL(verb)}께요`, vowel ? `${stem}을게요` : `${withN(verb)}게요`];
      break;
    case 'llaeyo':
      c = [`${withL(verb)}레요`, vowel ? `${stem}을래요` : `${withN(verb)}래요`];
      break;
    case 'gesseoyo':
      c = [`${stem}겠요`, `${stem}갰어요`];
      break;
    case 'neundeV':
      c = [vowel ? `${withN(verb)}데` : `${stem}은데`, `${withL(verb)}데`];
      break;
    case 'neundeA':
      c = takesNeun(verb) ? [`${stem}은데`, `${withL(verb)}데`] : [`${stem}는데`, `${withL(verb)}데`];
      break;
    case 'pastNeunde':
      c = [`${pastStemOf(verb)}은데`, `${haeyo(verb)}는데`];
      break;
    case 'neyo':
      c = [`${info(verb)}네요`, s.jong === 'ㄹ' ? `${stem}네요` : vowel ? `${stem}으네요` : `${stem}는네요`];
      break;
    case 'pastNeyo':
      c = [`${pastStemOf(verb)}으네요`, `${haeyo(verb)}네요`];
      break;
    case 'jyo':
      c = [`${info(verb)}죠`, `${stem}죠요`];
      break;
    case 'handaV':
      // Ловушки: словарная форма вместо 한다체 и неверный вариант окончания.
      c = [verb, s.jong && s.jong !== 'ㄹ' ? `${stem}은다` : `${stem}는다`];
      break;
    case 'handaPast':
      c = [conj(verb, 'past'), `${pastStemOf(verb)}는다`];
      break;
    case 'handaFut':
      c = [`${withL(verb)} 거예요`, `${withN(verb)} 것이다`];
      break;
    case 'indV':
      c = [`${verb}고 했어요`, s.jong && s.jong !== 'ㄹ' ? `${stem}은다고 했어요` : `${stem}는다고 했어요`];
      break;
    case 'indA':
      c = [`${stem}는다고 했어요`, `${haeyo(verb)}고 했어요`];
      break;
    case 'indPast':
      c = [`${pastStemOf(verb)}는다고 했어요`, `${conj(verb, 'past')}고 했어요`];
      break;
    case 'daeyoV':
      c = [`${stem}대요`, `${neunda(verb).slice(0, -1)}데요`];
      break;
    case 'daeyoA':
      c = [`${stem}는대요`, `${stem}데요`];
      break;
    case 'indQ':
      c = [s.jong === 'ㄹ' ? `${stem}냐고 했어요` : `${haeyo(verb)}냐고 했어요`, `${stem}냬고 했어요`];
      break;
    case 'indCmd':
      c = [vowel ? `${stem}으라고 했어요` : s.jong === 'ㄹ' ? `${stem}으라고 했어요` : `${stem}라고 했어요`, `${haeyo(verb)}라고 했어요`];
      break;
    case 'indSug':
      c = [`${stem}자다고 했어요`, `${haeyo(verb)}자고 했어요`];
      break;
    case 'gotgataV':
      c = [`${withN(verb)} 것 같아요`, `${withL(verb)} 것 같아요`];
      break;
    case 'gotgataPast':
      c = [`${withNeun(verb)} 것 같아요`, `${withL(verb)} 것 같아요`];
      break;
    case 'gotgataFut':
      c = [`${withN(verb)} 것 같아요`, `${withNeun(verb)} 것 같아요`];
      break;
    case 'gotgataA':
      c = takesNeun(verb) ? [`${stem}은 것 같아요`, `${haeyo(verb)} 것 같아요`] : [`${stem}는 것 같아요`, `${haeyo(verb)} 것 같아요`];
      break;
    case 'nabwayo':
      c = [`${haeyo(verb)}나 봐요`, s.jong === 'ㄹ' ? `${stem}나 봐요` : `${stem}으나 봐요`];
      break;
    case 'pastNabwayo':
      c = [`${pastStemOf(verb)}은가 봐요`, `${conj(verb, 'past')}나 봐요`];
      break;
    case 'ngabwayo':
      c = [`${stem}는가 봐요`, `${stem}은가 봐요`, `${haeyo(verb).slice(0, -1)}나 봐요`];
      break;
    case 'gedwae':
      c = [`${stem}기 됐어요`, `${withN(verb)}게 됐어요`];
      break;
    case 'eojida':
      // «춥게 됐어요» грамматично — его не берём.
      c = [`${stem}졌어요`, `${haeyo(verb)}졌어요`];
      break;
    case 'neungeot':
      c = [`${withN(verb)} 것`, `${stem}기 것`];
      break;
    case 'eum':
      c = [`${stem}음`, `${stem}기음`];
      break;
    case 'giwihae':
      c = [`${withN(verb)} 위해서`, `${stem}게 위해서`];
      break;
    case 'jamaja':
      c = [`${info(verb)}자마자`, `${withN(verb)} 자마자`, `${stem}고자마자`];
      break;
    case 'daga':
      c = [`${info(verb)}다가`, `${stem}고다가`];
      break;
    case 'pastDaga':
      c = [`${conj(verb, 'past')}다가`, `${pastStemOf(verb)}는다가`];
      break;
    case 'gehada':
      c = [`${stem}기 했어요`, `${info(verb)}게 했어요`];
      break;
    case 'deoragoyo':
      // Частая орфографическая ошибка: -드라고요.
      c = [`${stem}드라고요`, `${info(verb)}더라고요`];
      break;
    case 'pastDeoragoyo':
      c = [`${pastStemOf(verb)}드라고요`, `${conj(verb, 'past')}더라고요`];
      break;
    case 'deon':
      c = [`${info(verb)}던`, `${withNeun(verb)}던`];
      break;
    case 'pastDeon':
      c = [`${conj(verb, 'past')}던`, `${pastStemOf(verb)}는`];
      break;
    case 'ado':
      // Прошедшее (갔어도) и -(으)ㄴ/는데도 — тоже уступка и грамматичны, поэтому не берём их.
      c = [`${stem}${isBright(s.jung) ? '어' : '아'}도`, `${stem}도`, `${haeyo(verb)}도`];
      break;
    case 'deorado':
      // 갔더라도 грамматично, ловушки — орфография (드라도) и лишняя гласная -아/어.
      c = [`${stem}드라도`, `${info(verb)}더라도`];
      break;
    case 'ljirado':
      // Пишется 지, хотя слышится [찌]: 갈찌라도 — частая ошибка.
      c = [`${withL(verb)}찌라도`, vowel ? `${stem}을지라도` : s.jong === 'ㄹ' ? `${stem}을지라도` : `${stem}지라도`, `${withN(verb)}지라도`];
      break;
    case 'neundedoV':
      // Ловушки — определение прилагательного (먹은데도) и несуществующие 자은데도, 살는데도, 먹어는데도.
      // «잔데도» не берём: слитно читается как «잔 데도» («и место, где спал»).
      c = vowel ? [`${stem}은데도`, `${withL(verb)}는데도`] : s.jong === 'ㄹ' ? [`${stem}는데도`, `${stem}은데도`] : [`${stem}은데도`, `${info(verb)}는데도`];
      break;
    case 'neundedoA':
      c = takesNeun(verb) ? [`${stem}은데도`, `${info(verb)}는데도`] : [`${stem}는데도`, vowel ? `${stem}은데도` : `${stem}은데도`, `${info(verb)}는데도`];
      break;
    case 'pastNeundedo':
      c = [`${pastStemOf(verb)}은데도`, `${pastStemOf(verb)}데도`];
      break;
    case 'banmyeonV':
      // «간 반면에» — верное прошедшее, поэтому ловушки только неграмматичные: 가은, 먹어는, 살는, -기 반면에.
      c = [vowel ? `${stem}은 반면에` : s.jong === 'ㄹ' ? `${stem}는 반면에` : `${info(verb)}는 반면에`, `${stem}기 반면에`];
      break;
    case 'banmyeonA':
      c = takesNeun(verb) ? [`${stem}은 반면에`, `${info(verb)}는 반면에`] : [`${stem}는 반면에`, `${stem}은 반면에`, `${stem}기 반면에`];
      break;
    case 'pastBanmyeon':
      c = [`${pastStemOf(verb)}는 반면에`, `${pastStemOf(verb)}은 반면에`];
      break;
    case 'debanhaeV':
      c = vowel ? [`${stem}은데 반해`, `${withL(verb)}는데 반해`] : s.jong === 'ㄹ' ? [`${stem}는데 반해`, `${stem}은데 반해`] : [`${stem}은데 반해`, `${info(verb)}는데 반해`];
      break;
    case 'debanhaeA':
      c = takesNeun(verb) ? [`${stem}은데 반해`, `${info(verb)}는데 반해`] : [`${stem}는데 반해`, `${stem}은데 반해`, `${info(verb)}는데 반해`];
      break;
    case 'gineun':
      // Не берём «-기도 하지만», «-긴 하지만», «-기는 하지마는» — грамматичны.
      c = [`${stem}기은 하지만`, `${info(verb)}기는 하지만`, `${stem}기는 해지만`];
      break;
    case 'pastGineun':
      // «-기는 하였지만» и «가기는 갔지만» верны; ловушки — 했찌만, 기은, лишнее -아/어.
      c = [`${stem}기는 했찌만`, `${stem}기은 했지만`, `${info(verb)}기는 했지만`];
      break;
    case 'barame':
      // -는 바람에 бывает только с -는: прошедшее (간 바람에, 갔는 바람에) — ошибка.
      c = [`${withN(verb)} 바람에`, `${pastStemOf(verb)}는 바람에`, `${stem}기 바람에`];
      break;
    case 'neurago':
      // «먹으라고» не берём — это косвенный приказ. Ошибки: прошедшее перед -느라고, лишнее -아/어, сохранённая ㄹ.
      c = [`${pastStemOf(verb)}느라고`, s.jong === 'ㄹ' ? `${stem}느라고` : vowel ? `${withN(verb)}느라고` : `${info(verb)}느라고`];
      break;
    case 'deokbun':
    case 'tatPast': {
      // «-는 덕분에/탓에» (настоящее) грамматично, поэтому не берём.
      const n = form === 'deokbun' ? '덕분에' : '탓에';
      c = [`${withL(verb)} ${n}`, `${pastStemOf(verb)}은 ${n}`, `${stem}기 ${n}`];
      break;
    }
    case 'deokbunA':
    case 'tatA': {
      const n = form === 'deokbunA' ? '덕분에' : '탓에';
      c = takesNeun(verb) ? [`${stem}은 ${n}`, `${stem}기 ${n}`] : [`${stem}는 ${n}`, `${stem}은 ${n}`, `${stem}기 ${n}`];
      break;
    }
    case 'deoramyeon':
      // «갔으면», «갔다면» и архаичное «갔더면» грамматичны — не берём. Ошибки: без -았/었-, орфография -드라면.
      c = [`${stem}더라면`, `${pastStemOf(verb)}드라면`];
      break;
    case 'lppeon':
      // Только -(으)ㄹ 뻔하다; 번 вместо 뻔 — орфографическая ошибка.
      c = [`${withN(verb)} 뻔했어요`, `${withL(verb)} 번했어요`, `${stem}기 뻔했어요`];
      break;
    case 'ndamyeonV':
      // Ошибки: словарная форма (가다면), неверный вариант -는다/-ㄴ다 (먹은다면, 가는다면).
      c = [`${verb}면`, s.jong && s.jong !== 'ㄹ' ? `${stem}은다면` : `${stem}는다면`];
      break;
    case 'damyeonA':
      // «있는다면» не берём: 있다 как глагол «оставаться» так и спрягается (여기 있는다면).
      c = takesNeun(verb) ? [`${stem}은다면`, `${haeyo(verb)}면`] : [`${withN(verb)}다면`, `${stem}는다면`];
      break;
    case 'pastDamyeon':
      c = [`${pastStemOf(verb)}는다면`, `${conj(verb, 'past')}면`];
      break;
    case 'geodeunyo':
      // «간 거든요» не берём: разговорное «간 것이거든요» возможно.
      c = [`${stem}거던요`, `${stem}거등요`, `${info(verb)}거든요`];
      break;
    case 'pastGeodeunyo':
      c = [`${pastStemOf(verb)}거던요`, `${conj(verb, 'past')}거든요`];
      break;
    case 'janayo':
      // 쟎아요 — старое написание, по норме ошибка.
      c = [`${stem}쟎아요`, `${stem}잔아요`, `${info(verb)}잖아요`];
      break;
    case 'pastJanayo':
      c = [`${pastStemOf(verb)}쟎아요`, `${pastStemOf(verb)}잔아요`];
      break;
    case 'ltende':
      c = [`${withN(verb)} 텐데`, `${withL(verb)} 탠데`, `${withNeun(verb)} 텐데`];
      break;
    case 'lgeonde':
      // «간 건데», «가는 건데» грамматичны (것인데), поэтому ловушки — орфография и несуществующие основы.
      c = [`${withL(verb)} 껀데`, vowel || s.jong === 'ㄹ' ? `${stem}을 건데` : `${stem} 건데`];
      break;
    case 'deoni':
      c = [`${stem}드니`, `${info(verb)}더니`, `${withN(verb)}더니`];
      break;
    case 'pastDeoni':
      c = [`${pastStemOf(verb)}드니`, `${conj(verb, 'past')}더니`];
      break;
    case 'dorok':
      c = [`${info(verb)}도록`, `${stem}도륵`, `${withL(verb)}도록`];
      break;
    case 'goja':
      c = [`${info(verb)}고자`, `${stem}구자`, `${withL(verb)}고자`];
      break;
    case 'lgyeom':
      c = [`${withN(verb)} 겸`, `${withNeun(verb)} 겸`, `${stem}기 겸`];
      break;
    case 'ljeongdoro':
      // «-는 정도로» встречается («말할 수 없는 정도로») — не берём.
      c = [`${stem}기 정도로`, vowel || s.jong === 'ㄹ' ? `${stem}을 정도로` : `${stem} 정도로`];
      break;
    case 'lsurok':
      // «갈 수록» — частая ошибка в пробеле: 수록 пишется слитно.
      c = [`${withL(verb)} 수록`, `${withNeun(verb)}수록`, `${withN(verb)}수록`];
      break;
    case 'giman':
      // «-기만 하면은», «-기만 하며» грамматичны — не берём.
      c = [`${info(verb)}기만 하면`, `${stem}기만 해면`, `${stem}기면 하면`];
      break;
    case 'gimanhaeyo':
      c = [`${stem}기만 하요`, `${info(verb)}기만 해요`, `${stem}기만 해어요`];
      break;
    case 'go':
      // «-아/어서» и «-고서» грамматичны, ловушки — лишнее -아/어 и -구.
      c = [`${info(verb)}고`, `${stem}구`, `${withN(verb)}고`];
      break;
    case 'juseyo':
      // «사서 주세요» («купите и дайте») грамматично — не берём.
      c = [`${stem}${isBright(s.jung) ? '어' : '아'} 주세요`, `${stem}기 주세요`, `${stem} 주세요`];
      break;
    case 'jimaseyo':
      // «-지 마요», «-지 말아요» — разговорные, но верные; не берём.
      c = [`${info(verb)}지 마세요`, `${stem}기 마세요`, `${stem}지 말세요`];
      break;
    case 'gonaseo':
      c = [`${info(verb)}고 나서`, `${withN(verb)} 나서`, `${stem}기 나서`];
      break;
    case 'geona':
      c = [`${info(verb)}거나`, `${withN(verb)}거나`];
      break;
    case 'ljulalda':
      // «간 줄 알아요», «가는 줄 알아요» («думает, что пошёл / идёт») грамматичны — не берём.
      c = [`${stem}기 줄 알아요`, vowel || s.jong === 'ㄹ' ? `${stem}을 줄 알아요` : `${stem} 줄 알아요`];
      break;
    case 'jianhado':
      c = [`${stem}지 안아도 돼요`, `${info(verb)}지 않아도 돼요`, `${stem}지 않아서 돼요`];
      break;
    case 'eosseumyeon':
      // «가면 좋겠어요» грамматично (о будущем) — не берём.
      c = [`${conj(verb, 'past')}면 좋겠어요`, `${pastStemOf(verb)}면 좋겠어요`];
      break;
    case 'ryeomyeon':
      c = [vowel ? `${stem}으려면` : s.jong === 'ㄹ' ? `${stem}으려면` : `${stem}려면`, `${info(verb)}려면`, `${withN(verb)}려면`];
      break;
    case 'lkkahada':
      c = [`${withN(verb)}까 해요`, `${withL(verb)}까 하요`];
      break;
    case 'nji':
      // «가는지», «갈지» — другие верные конструкции, не берём.
      c = [`${stem}기 지`, `${pastStemOf(verb)}은 지`];
      break;
    case 'jungida':
      c = [`${withN(verb)} 중이에요`, `${stem}기 중이에요`, `${stem}고 중이에요`];
      break;
    case 'geoeottaeyo':
      // «간 게 어때요?» («как прошло то, что сходил?») возможно — не берём.
      c = [`${stem}기 게 어때요`, `${info(verb)}는 게 어때요`];
      break;
    case 'gunyoV':
      // У глаголов нужен -는-: «먹군요», «간군요» — ошибки.
      c = [`${stem}군요`, `${withN(verb)}군요`, `${info(verb)}군요`];
      break;
    case 'gunyoA':
      c = [`${stem}는군요`, `${info(verb)}군요`, `${withN(verb)}군요`];
      break;
    case 'boyeoyo':
      // «-게 보여요» грамматично — не берём.
      c = [`${stem} 보여요`, `${withN(verb)} 보여요`];
      break;
    case 'geAdv':
      c = [`${info(verb)}게`, `${withN(verb)}게`];
      break;
    case 'ahada':
      c = [`${stem}해요`, `${stem}${isBright(s.jung) ? '어' : '아'}해요`];
      break;
    case 'aitda':
      // «-고 있어요» (процесс) грамматично — не берём.
      c = [`${stem}${isBright(s.jung) ? '어' : '아'} 있어요`, `${info(verb)}서 있어요`];
      break;
    case 'anota':
      c = [`${stem}${isBright(s.jung) ? '어' : '아'} 놓았어요`, `${stem}고 놓았어요`];
      break;
    case 'abeorida':
      // «먹고 버렸어요» («съел и выбросил») грамматично — не берём.
      c = [`${stem}${isBright(s.jung) ? '어' : '아'} 버렸어요`, `${withN(verb)} 버렸어요`];
      break;
    case 'gomalda':
      c = [`${info(verb)}고 말았어요`, `${stem}기 말았어요`];
      break;
    case 'ljido':
      c = [`${withL(verb)} 지도 몰라요`, vowel || s.jong === 'ㄹ' ? `${stem}을지도 몰라요` : `${stem}지도 몰라요`];
      break;
    case 'lkkabwa':
      c = [`${withN(verb)}까 봐`, `${stem}기까 봐`];
      break;
    case 'neundaero':
      // «말한 대로» («как сказал») и «-(으)ㄹ 대로» верны — не берём.
      c = [`${stem}기 대로`, `${info(verb)}는 대로`, `${withNeun(verb)} 데로`];
      break;
    case 'gonhada':
      c = [`${info(verb)}곤 했어요`, `${stem}군 했어요`, `${withN(verb)}곤 했어요`];
      break;
    case 'pyeonV':
      // «먹은 편이에요» («съел сравнительно много») грамматично — не берём.
      c = [`${stem}기 편이에요`, `${info(verb)}는 편이에요`];
      break;
    case 'pyeonA':
      c = takesNeun(verb) ? [`${stem}은 편이에요`, `${info(verb)}는 편이에요`] : [`${stem}는 편이에요`, `${stem}은 편이에요`, `${stem}기 편이에요`];
      break;
    case 'lmanhada':
      c = [`${withN(verb)} 만해요`, `${stem}기 만해요`];
      break;
    case 'cheok':
      // «본 척했어요» (прошлое) грамматично — не берём.
      c = [`${stem}기 척했어요`, `${info(verb)}는 척했어요`, `${withL(verb)} 척했어요`];
      break;
    case 'raeyo':
      // «-ㄹ래요» — другое окончание (желание), не берём.
      c = [vowel || s.jong === 'ㄹ' ? `${stem}으래요` : `${stem}래요`, `${info(verb)}래요`];
      break;
    case 'jaeyo':
      c = [`${stem}제요`, `${info(verb)}재요`, `${withN(verb)}재요`];
      break;
    case 'nyaeyo':
      c = [`${stem}내요`, `${info(verb)}냬요`];
      break;
    case 'deunji':
      // «-던지» — частая ошибка написания (это прошедшее «-던»).
      c = [`${stem}던지`, `${info(verb)}든지`, `${withN(verb)}든지`];
      break;
    case 'abwatja':
      c = [`${stem}${isBright(s.jung) ? '어' : '아'} 봤자`, `${stem}기 봤자`];
      break;
    case 'lppunman':
      c = [`${withN(verb)} 뿐만 아니라`, `${withNeun(verb)} 뿐만 아니라`];
      break;
    case 'dedagaV':
      c = [`${stem}기 데다가`, `${info(verb)}는 데다가`];
      break;
    case 'dedagaA':
      c = takesNeun(verb) ? [`${stem}은 데다가`, `${info(verb)}는 데다가`] : [`${stem}는 데다가`, `${stem}은 데다가`];
      break;
    case 'gillae':
      c = [`${stem}길레`, `${info(verb)}길래`, `${withN(verb)}길래`];
      break;
    case 'aseogeureonji':
      c = [`${pastStemOf(verb)}어서 그런지`, `${stem}서 그런지`];
      break;
    case 'ltenikka':
      c = [`${withN(verb)} 테니까`, `${withL(verb)} 태니까`];
      break;
    case 'lgeolgeuraetda':
      c = [`${withN(verb)} 걸 그랬어요`, `${withL(verb)} 껄 그랬어요`];
      break;
    case 'lliga':
      // «-(으)ㄴ 리가 없다» встречается (범인인 리가 없다) — не берём.
      c = [`${stem}기 리가 없어요`, `${withL(verb)} 니가 없어요`];
      break;
    case 'ayajiyo':
      // «-아/어야죠» — верное сокращение, не берём.
      c = [`${stem}야지요`, `${stem}${isBright(s.jung) ? '어' : '아'}야지요`, `${info(verb)}야죠요`];
      break;
    case 'lgeolyo':
      // «간걸요», «가는걸요» — другие верные формы, не берём.
      c = [`${withL(verb)}껄요`, vowel || s.jong === 'ㄹ' ? `${stem}을걸요` : `${stem}걸요`];
      break;
    case 'gineunyo':
      // «-긴요» — верное сокращение, не берём.
      c = [`${info(verb)}기는요`, `${stem}기은요`];
      break;
    case 'deondeyo':
      c = [`${stem}든데요`, `${info(verb)}던데요`];
      break;
    case 'dabomyeon':
      // «-다가 보면» — полная форма, верна; не берём.
      c = [`${info(verb)}다 보면`, `${withN(verb)}다 보면`];
      break;
    case 'nchaero':
      c = [`${withNeun(verb)} 채로`, `${withL(verb)} 채로`];
      break;
    case 'ryeodeon':
      c = [vowel || s.jong === 'ㄹ' ? `${stem}으려던 참이에요` : `${stem}려던 참이에요`, `${withN(verb)}려던 참이에요`];
      break;
    case 'gimaryeon':
      // «-게 마련이다» — верный синоним, не берём.
      c = [`${withNeun(verb)} 마련이다`, `${withL(verb)} 마련이다`, `${stem}기 마련하다`];
      break;
    case 'lsubakke':
      c = [`${withN(verb)} 수밖에 없다`, `${stem}기 수밖에 없다`, `${withL(verb)} 수밖에 있다`];
      break;
    case 'gisipsang':
      c = [`${withL(verb)} 십상이다`, `${info(verb)}기 십상이다`];
      break;
    case 'lbeophada':
      // «-는 법이다» («так уж заведено») — другая верная конструкция, не берём.
      c = [`${withN(verb)} 법하다`, `${stem}기 법하다`];
      break;
    case 'eumettara':
      // «-기에 따라» («смотря как») грамматично — не берём.
      c = [`${withN(verb)}에 따라`, `${info(verb)}에 따라`];
      break;
    case 'neunhan':
      c = [`${withN(verb)} 한`, `${withL(verb)} 한`, `${stem}기 한`];
      break;
    case 'nisang':
      // «-는 이상» (о настоящем: 학생인 이상) грамматично — не берём.
      c = [`${withL(verb)} 이상`, `${stem}기 이상`];
      break;
    case 'eumeuro':
      // «-(으)ㅁ으로» («тем, что») — другая верная форма, не берём.
      c = [vowel || s.jong === 'ㄹ' ? `${stem}으므로` : `${stem}므로`, `${info(verb)}므로`];
      break;
    case 'gie':
      c = [`${info(verb)}기에`, `${withN(verb)}기에`];
      break;
    case 'eumeurosseo':
      // 로써 (средство) ≠ 로서 (в качестве): «노력함으로서» — частая ошибка.
      c = [`${eum(verb)}으로서`, `${stem}기로써`];
      break;
    case 'neuni':
      c = [`${info(verb)}느니`, `${withN(verb)}느니`, `${withNeun(verb)}니`];
      break;
    case 'lbaeya':
      // «-(으)ㄴ 바에야» (이왕 시작한 바에야) и «-ㄹ 바엔» грамматичны — не берём.
      c = [`${stem}기 바에야`, `${withL(verb)} 바에서`];
      break;
    case 'geon':
      // «-던», «-(으)ㄴ 건» — другие верные формы, не берём.
      c = [`${info(verb)}건`, `${stem}껀`];
      break;
    case 'dagibodaV':
      // «가기보다는» («чем идти») грамматично — не берём.
      c = [`${verb}기보다는`, vowel || s.jong === 'ㄹ' ? `${stem}는다기보다는` : `${stem}은다기보다는`];
      break;
    case 'dagibodaA':
      c = [`${withN(verb)}다기보다는`, `${stem}는다기보다는`];
      break;
    case 'gineunkeonyeong':
      // 커녕 — частица, пишется слитно.
      c = [`${stem}기는 커녕`, `${info(verb)}기는커녕`, `${stem}기커녕`];
      break;
    case 'lmangjeong':
      c = [`${withL(verb)} 망정`, `${withN(verb)}망정`];
      break;
    case 'nsem':
      // «-(으)ㄹ 셈이다» («собираюсь») и «-는 셈이다» грамматичны — не берём.
      c = [`${stem}기 셈이다`, `${info(verb)} 셈이다`];
      break;
    case 'ginareum':
      c = [`${stem}게 나름이다`, `${info(verb)}기 나름이다`];
      break;
    case 'lttareum':
      c = [`${withN(verb)} 따름이다`, `${stem}기 따름이다`];
      break;
    case 'dasipi':
      c = [`${info(verb)}다시피`, `${stem}다싶이`];
      break;
    case 'nbawa':
      // «-는 바와 같이» (о настоящем) грамматично — не берём.
      c = [`${withL(verb)} 바와 같이`, `${stem}기 바와 같이`];
      break;
    case 'deusi':
      // «-(으)ㄴ/는 듯이» тоже верно — не берём.
      c = [`${info(verb)}듯이`, `${stem}듯히`];
      break;
    case 'deutV':
      // «-(으)ㄴ 듯하다», «-(으)ㄹ 듯하다» — другие времена, верны; не берём.
      c = [`${stem}기 듯하다`, `${info(verb)}는 듯하다`];
      break;
    case 'deutA':
      c = takesNeun(verb) ? [`${stem}은 듯하다`, `${info(verb)}는 듯하다`] : [`${stem}는 듯하다`, `${stem}은 듯하다`, `${info(verb)}는 듯하다`];
      break;
    // ---- 6급 ----
    case 'namana':
      c = [`${stem}기 마나`, vowel ? `${stem}으나 마나` : `${stem}나 마나`, `${withN(verb)} 마나`];
      break;
    case 'giemangjeong':
      // «-기에 망정이지» в настоящем (네가 있기에 망정이지) и синоним «-(으)니 망정이지» грамматичны — не берём.
      c = [`${pastStemOf(verb)}기 망정이지`, `${withN(verb)}기에 망정이지`];
      break;
    case 'geoniwa':
    case 'pastGeoniwa':
      c = [`${withNeun(verb)}거니와`, `${withN(verb)}거니와`, `${stem}기니와`];
      break;
    case 'ljindae':
      // 진대 пишется слитно.
      c = [`${withL(verb)} 진대`, `${withN(verb)}진대`, `${stem}기진대`];
      break;
    case 'nora':
      c = [`${withN(verb)}노라`, `${info(verb)}노라`, `${stem}노다`];
      break;
    case 'pastNora':
      c = [`${pastStemOf(verb)}다노라`, `${withN(verb)}노라`, `${pastStemOf(verb)}노다`];
      break;
    case 'lira':
      c = [vowel || s.jong === 'ㄹ' ? `${stem}으리라` : `${stem}리라`, `${withL(verb)}리라`, `${info(verb)}리라`];
      break;
    case 'doda':
      c = [`${info(verb)}도다`, `${withN(verb)}도다`, `${stem}로다`];
      break;
    case 'ljieoda':
      c = [`${withL(verb)} 지어다`, `${withN(verb)}지어다`, `${stem}기지어다`];
      break;
    case 'hao':
      // «먹으오» — старый, но верный вариант 하오체; после гласной «-소» (하소) встречается в диалектах — не берём.
      c = [`${stem}습소`, vowel ? `${stem}으오` : `${stem}오`];
      break;
    case 'pastHao':
      c = [`${pastStemOf(verb)}오`, `${pastStemOf(verb)}습소`];
      break;
    case 'hasio':
      c = [`${info(verb)}시오`, vowel ? `${stem}으시오` : `${stem}시오`, `${withN(verb)}시오`];
      break;
    case 'hageSt':
      c = [`${info(verb)}네`, `${withN(verb)}네`, `${stem}습네`];
      break;
    case 'hageQ':
      // «-는가» — тоже вопрос 하게체 (가는가), не берём.
      c = [`${info(verb)}나`, `${withN(verb)}나`, `${stem}습나`];
      break;
    case 'hageCmd':
      // «-게나» — тоже приказ 하게체 (가게나), не берём.
      c = [`${info(verb)}게`, `${stem}으게`, `${stem}게세`];
      break;
    case 'hageSug':
      c = [`${info(verb)}세`, `${withN(verb)}세`, `${stem}읍세`];
      break;
    case 'deoniman':
      c = [`${info(verb)}더니만`, `${withN(verb)}더니만`, `${withL(verb)}더니만`];
      break;
    case 'eumedo':
    case 'pastEumedo':
      // «-는데도 불구하고» — другая верная конструкция, не берём.
      c = [`${info(verb)}도 불구하고`, `${withN(verb)}에도 불구하고`, `${stem}기에도 불구하고`];
      break;
    case 'dagoV':
      c = [`${verb}고 볼 수 있다`, `${withNeun(verb)}다고 볼 수 있다`, `${withN(verb)}다고 볼 수 있다`];
      break;
    case 'dagoA':
      c = [`${withN(verb)}다고 볼 수 있다`, `${withNeun(verb)}다고 볼 수 있다`];
      break;
    case 'lgeoseuro':
      // «-(으)ㄴ 것으로 보인다» (прошедшее) и «-(으)ㄹ 것으로 본다» грамматичны — не берём.
      c = [`${stem}기 것으로 보인다`, `${withL(verb)} 것으로써 보인다`];
      break;
    case 'myeonan':
      // «-아/어도 안 돼요» не берём: «даже если…, не годится» — грамматично.
      c = [vowel ? `${stem}으면 안 돼요` : `${stem}면 안 돼요`, `${info(verb)}면 안 돼요`, `${withNeun(verb)}면 안 돼요`];
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
