// Сино-корейские числительные: даты, деньги, номера телефонов, минуты.
const DIGIT = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const SMALL = ['', '십', '백', '천'];
const BIG = ['', '만', '억', '조'];

/** 0 ≤ n < 10000 */
function group(n: number, dropOne: boolean): string {
  let out = '';
  const ds = String(n).padStart(4, '0').split('').map(Number);
  ds.forEach((d, i) => {
    const pos = 3 - i;
    if (!d) return;
    // 일 перед 십/백/천 не произносится: 십, 백, 천 (но 일 в конце числа остаётся)
    out += (d === 1 && pos > 0 ? '' : DIGIT[d]) + SMALL[pos];
  });
  return dropOne && out === '일' ? '' : out;
}

/** Число словами. Группы по 만 пишутся раздельно: 15000 → «만 오천». */
export function sino(n: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error(`Нужно целое неотрицательное: ${n}`);
  if (n === 0) return '영';
  const parts: string[] = [];
  for (let i = 0; n > 0; i++, n = Math.floor(n / 10000)) {
    const g = n % 10000;
    if (!g) continue;
    // 10000 → 만 (не 일만), но 100000000 → 일억
    const word = group(g, i === 1) + BIG[i];
    parts.unshift(word);
  }
  return parts.join(' ');
}

export function won(n: number): string {
  return `${sino(n)} 원`;
}

/** Телефон читается по цифрам, ноль — 공: 010 → 공일공. */
export function phone(digits: string): string {
  return digits
    .split('-')
    .map((p) => p.split('').map((d) => (d === '0' ? '공' : DIGIT[Number(d)])).join(''))
    .join('에 ');
}

export function formatWon(n: number): string {
  return `${n.toLocaleString('en-US')}원`;
}
