// Раскладка текста по бланку 원고지 по правилам TOPIK II (задания 53–54):
// • абзац начинается с пустой клетки; • каждый слог, знак и пробел — отдельная клетка;
// • две цифры или две латинские буквы занимают одну клетку; • пробел в начале строки не пишется;
// • знак препинания, не поместившийся в строку, ставится в последнюю клетку вместе со слогом.

export type CellKind = 'char' | 'punct' | 'pair' | 'space' | 'indent';
export interface Cell {
  text: string;
  kind: CellKind;
}

const PUNCT = /[.,?!'"“”‘’·…:;()]/;
const PAIRABLE = /[0-9A-Za-z%]/;

export function layout(text: string, cols = 20): Cell[][] {
  const rows: Cell[][] = [];
  let row: Cell[] = [];
  const push = (c: Cell) => {
    if (row.length === cols) {
      if (c.kind === 'punct' && rows.length >= 0) {
        // знак в конце строки — в ту же клетку, что и последний слог
        row[row.length - 1] = { text: row[row.length - 1].text + c.text, kind: row[row.length - 1].kind };
        return;
      }
      rows.push(row);
      row = [];
      if (c.kind === 'space') return; // пробел в начале строки не пишется
    }
    row.push(c);
  };
  const paragraphs = text.replace(/\r/g, '').split('\n').filter((p, i, a) => p.trim() || i < a.length - 1);
  paragraphs.forEach((para, pi) => {
    if (pi > 0 && row.length) {
      rows.push(row);
      row = [];
    }
    const p = para.trim();
    if (!p) return;
    push({ text: '', kind: 'indent' });
    for (let i = 0; i < p.length; i++) {
      const ch = p[i];
      if (ch === ' ') {
        if (row.length === 0 || (row.length === cols)) {
          if (row.length === cols) {
            rows.push(row);
            row = [];
          }
          continue;
        }
        push({ text: '', kind: 'space' });
      } else if (PUNCT.test(ch)) push({ text: ch, kind: 'punct' });
      else if (PAIRABLE.test(ch) && PAIRABLE.test(p[i + 1] ?? '')) {
        push({ text: ch + p[i + 1], kind: 'pair' });
        i++;
      } else push({ text: ch, kind: 'char' });
    }
  });
  if (row.length) rows.push(row);
  return rows;
}

/** Количество знаков так, как его считают на TOPIK: все символы, включая пробелы, без переводов строки. */
export function topikLength(text: string): number {
  return text.replace(/\r?\n/g, '').length;
}
