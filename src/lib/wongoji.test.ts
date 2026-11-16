import { describe, expect, it } from 'vitest';
import { lengthIssue, styleIssues } from './writing';
import { layout, topikLength } from './wongoji';

describe('원고지', () => {
  it('абзац с отступа, пробел — клетка, две цифры в одной клетке', () => {
    const rows = layout('나는 2024년에 왔다.', 20);
    const cells = rows[0];
    expect(cells[0].kind).toBe('indent');
    expect(cells.map((c) => c.text).join('|')).toBe('|나|는||20|24|년|에||왔|다|.');
  });

  it('знак препинания в конце строки — в последнюю клетку', () => {
    const rows = layout('가나다라마.', 5); // отступ + 4 слога = 5 клеток, 마 на новой строке
    expect(rows[0].map((c) => c.text)).toEqual(['', '가', '나', '다', '라']);
    const rows2 = layout('가나다라.', 5);
    expect(rows2).toHaveLength(1);
    expect(rows2[0][4].text).toBe('라.');
  });

  it('пробел в начале строки не пишется', () => {
    const rows = layout('가나다라 마바', 5);
    expect(rows[1][0].text).toBe('마');
  });

  it('новый абзац — новая строка с отступом', () => {
    const rows = layout('가나.\n다라.', 20);
    expect(rows).toHaveLength(2);
    expect(rows[1][0].kind).toBe('indent');
  });

  it('счёт знаков как на TOPIK — с пробелами', () => {
    expect(topikLength('나는 학생이다.\n')).toBe(8);
  });
});

describe('проверка письма', () => {
  it('находит разговорные окончания и 저', () => {
    const issues = styleIssues('저는 학생이에요. 날씨가 좋다. 감사합니다.');
    expect(issues.map((i) => i.kind)).toEqual(['style', 'style', 'pronoun']);
  });
  it('한다체 без замечаний', () => {
    expect(styleIssues('나는 매일 운동한다. 운동은 건강에 좋다.')).toEqual([]);
  });
  it('длина', () => {
    expect(lengthIssue('짧다.', 200, 300)?.kind).toBe('length');
    expect(lengthIssue('가'.repeat(250), 200, 300)).toBeNull();
  });
});
