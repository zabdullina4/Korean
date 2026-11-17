import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

const table: [string, Form, string][] = [
  ['가다', 'honPresent', '가세요'], ['읽다', 'honPresent', '읽으세요'], ['살다', 'honPresent', '사세요'], ['듣다', 'honPresent', '들으세요'],
  ['오다', 'honPast', '오셨어요'], ['받다', 'honPast', '받으셨어요'], ['하다', 'honPast', '하셨어요'], ['가다', 'honFormal', '가십니다'], ['읽다', 'honFormal', '읽으십니다'],
  ['하다', 'lgeyo', '할게요'], ['먹다', 'lgeyo', '먹을게요'], ['만들다', 'lgeyo', '만들게요'], ['듣다', 'lgeyo', '들을게요'], ['기다리다', 'lgeyo', '기다릴게요'], ['열다', 'lgeyo', '열게요'],
  ['먹다', 'llaeyo', '먹을래요'], ['마시다', 'llaeyo', '마실래요'], ['만들다', 'llaeyo', '만들래요'],
  ['하다', 'gesseoyo', '하겠어요'], ['오다', 'gesseoyo', '오겠어요'],
  ['가다', 'neundeV', '가는데'], ['먹다', 'neundeV', '먹는데'], ['살다', 'neundeV', '사는데'], ['공부하다', 'neundeV', '공부하는데'],
  ['좋다', 'neundeA', '좋은데'], ['크다', 'neundeA', '큰데'], ['춥다', 'neundeA', '추운데'], ['맛있다', 'neundeA', '맛있는데'], ['바쁘다', 'neundeA', '바쁜데'],
  ['가다', 'pastNeunde', '갔는데'], ['먹다', 'pastNeunde', '먹었는데'],
  ['잘하다', 'neyo', '잘하네요'], ['맛있다', 'neyo', '맛있네요'], ['멀다', 'neyo', '머네요'], ['예쁘다', 'neyo', '예쁘네요'],
  ['먹다', 'pastNeyo', '먹었네요'], ['오다', 'pastNeyo', '왔네요'],
  ['좋다', 'jyo', '좋죠'], ['맛있다', 'jyo', '맛있죠'], ['춥다', 'jyo', '춥죠'],
];

describe('формы юнитов 8–10', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(1);
    expect(d).not.toContain(want);
  });
});
