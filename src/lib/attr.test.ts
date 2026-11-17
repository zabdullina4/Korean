import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

const table: [string, Form, string][] = [
  ['가다', 'attrV', '가는'], ['먹다', 'attrV', '먹는'], ['살다', 'attrV', '사는'], ['만들다', 'attrV', '만드는'], ['듣다', 'attrV', '듣는'], ['공부하다', 'attrV', '공부하는'],
  ['좋다', 'attrA', '좋은'], ['크다', 'attrA', '큰'], ['예쁘다', 'attrA', '예쁜'], ['작다', 'attrA', '작은'], ['춥다', 'attrA', '추운'], ['맵다', 'attrA', '매운'],
  ['길다', 'attrA', '긴'], ['멀다', 'attrA', '먼'], ['하얗다', 'attrA', '하얀'], ['맛있다', 'attrA', '맛있는'], ['재미없다', 'attrA', '재미없는'], ['따뜻하다', 'attrA', '따뜻한'],
  ['먹다', 'attrPast', '먹은'], ['가다', 'attrPast', '간'], ['듣다', 'attrPast', '들은'], ['만들다', 'attrPast', '만든'], ['돕다', 'attrPast', '도운'],
  ['먹다', 'attrFut', '먹을'], ['가다', 'attrFut', '갈'], ['살다', 'attrFut', '살'], ['듣다', 'attrFut', '들을'],
];

describe('определительные формы', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(1);
    expect(d).not.toContain(want);
  });
});
