// Сборка и разбор слогов хангыля по формуле Unicode:
// код = 0xAC00 + (начальная × 21 + гласная) × 28 + конечная

export const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const;
export const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'] as const;
export const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const;

const BASE = 0xac00;
const LAST = 0xd7a3;

export interface Syllable {
  cho: string;
  jung: string;
  jong: string;
}

export function isSyllable(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  return ch.length === 1 && c >= BASE && c <= LAST;
}

export function compose(cho: string, jung: string, jong = ''): string | null {
  const i = CHO.indexOf(cho as (typeof CHO)[number]);
  const m = JUNG.indexOf(jung as (typeof JUNG)[number]);
  const f = JONG.indexOf(jong as (typeof JONG)[number]);
  if (i < 0 || m < 0 || f < 0) return null;
  return String.fromCharCode(BASE + (i * 21 + m) * 28 + f);
}

export function decompose(ch: string): Syllable | null {
  if (!isSyllable(ch)) return null;
  const n = ch.charCodeAt(0) - BASE;
  return { cho: CHO[Math.floor(n / 588)], jung: JUNG[Math.floor((n % 588) / 28)], jong: JONG[n % 28] };
}

/** Разложить строку на буквы (чамо): 한국 → ㅎㅏㄴㄱㅜㄱ */
export function toJamo(text: string): string[] {
  const out: string[] = [];
  for (const ch of text) {
    const s = decompose(ch);
    if (s) out.push(s.cho, s.jung, ...(s.jong ? [s.jong] : []));
    else out.push(ch);
  }
  return out;
}

/** Вертикальные гласные ставятся справа от согласной, горизонтальные — под ней. */
export function vowelShape(jung: string): 'right' | 'below' | 'mixed' {
  if (['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'].includes(jung)) return 'below';
  if (['ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'].includes(jung)) return 'mixed';
  return 'right';
}

/** Семь звучаний патчима: каждая конечная согласная читается как одна из ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ. */
const BATCHIM_SOUND: Record<string, string> = {
  ㄱ: 'ㄱ', ㄲ: 'ㄱ', ㅋ: 'ㄱ', ㄳ: 'ㄱ', ㄺ: 'ㄱ',
  ㄴ: 'ㄴ', ㄵ: 'ㄴ', ㄶ: 'ㄴ',
  ㄷ: 'ㄷ', ㅅ: 'ㄷ', ㅆ: 'ㄷ', ㅈ: 'ㄷ', ㅊ: 'ㄷ', ㅌ: 'ㄷ', ㅎ: 'ㄷ',
  ㄹ: 'ㄹ', ㄼ: 'ㄹ', ㄽ: 'ㄹ', ㄾ: 'ㄹ', ㅀ: 'ㄹ',
  ㅁ: 'ㅁ', ㄻ: 'ㅁ',
  ㅂ: 'ㅂ', ㅍ: 'ㅂ', ㅄ: 'ㅂ', ㄿ: 'ㅂ',
  ㅇ: 'ㅇ',
};

export function batchimSound(jong: string): string | null {
  return BATCHIM_SOUND[jong] ?? null;
}
