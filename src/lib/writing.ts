// Автоматические проверки письменного ответа (TOPIK 51–54): стиль 한다체, длина, «я» в письменной речи.
import { topikLength } from './wongoji';

export interface WritingIssue {
  kind: 'style' | 'pronoun' | 'length';
  text: string;
  hint: string;
}

/** Предложения, которые заканчиваются разговорными окончаниями (-요, -니다, -니까). */
export function styleIssues(text: string): WritingIssue[] {
  const out: WritingIssue[] = [];
  const sentences = text.split(/(?<=[.?!])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  for (const s of sentences) {
    const body = s.replace(/[.?!\s]+$/, '');
    if (/요$/.test(body)) out.push({ kind: 'style', text: s, hint: 'Окончание -요 — разговорный стиль. В письменном задании нужен 한다체: -ㄴ/는다, -다.' });
    else if (/니다$/.test(body)) out.push({ kind: 'style', text: s, hint: 'Окончание -ㅂ/습니다 — стиль докладов. В заданиях 53–54 пишут в 한다체.' });
    else if (/니까$/.test(body)) out.push({ kind: 'style', text: s, hint: 'Вопрос -ㅂ/습니까 — разговорный стиль.' });
  }
  if (/(^|\s)(저는|제가|저도|저의)/.test(text)) out.push({ kind: 'pronoun', text: '저는 / 제가', hint: 'В 한다체 «я» — 나는 / 내가 (или лучше вообще без «я» в эссе).' });
  return out;
}

export function lengthIssue(text: string, min: number, max: number): WritingIssue | null {
  const n = topikLength(text);
  if (n < min) return { kind: 'length', text: `${n} знаков`, hint: `Нужно не меньше ${min} знаков (считаются и пробелы).` };
  if (n > max) return { kind: 'length', text: `${n} знаков`, hint: `Не больше ${max} знаков — лишнее снижает балл.` };
  return null;
}
