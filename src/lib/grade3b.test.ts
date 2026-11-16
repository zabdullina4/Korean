import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

const table: [string, Form, string][] = [
  ['가다', 'gedwae', '가게 됐어요'], ['좋아하다', 'gedwae', '좋아하게 됐어요'], ['살다', 'gedwae', '살게 됐어요'], ['알다', 'gedwae', '알게 됐어요'],
  ['춥다', 'eojida', '추워졌어요'], ['예쁘다', 'eojida', '예뻐졌어요'], ['많다', 'eojida', '많아졌어요'], ['따뜻하다', 'eojida', '따뜻해졌어요'], ['크다', 'eojida', '커졌어요'],
  ['요리하다', 'neungeot', '요리하는 것'], ['배우다', 'neungeot', '배우는 것'], ['살다', 'neungeot', '사는 것'], ['듣다', 'neungeot', '듣는 것'],
  ['가다', 'eum', '감'], ['먹다', 'eum', '먹음'], ['살다', 'eum', '삶'], ['만들다', 'eum', '만듦'], ['돕다', 'eum', '도움'], ['듣다', 'eum', '들음'], ['하다', 'eum', '함'], ['있다', 'eum', '있음'],
  ['가다', 'giwihae', '가기 위해서'], ['배우다', 'giwihae', '배우기 위해서'],
  ['도착하다', 'jamaja', '도착하자마자'], ['먹다', 'jamaja', '먹자마자'], ['듣다', 'jamaja', '듣자마자'],
  ['가다', 'daga', '가다가'], ['공부하다', 'daga', '공부하다가'], ['먹다', 'daga', '먹다가'], ['듣다', 'daga', '듣다가'],
  ['입다', 'pastDaga', '입었다가'], ['가다', 'pastDaga', '갔다가'], ['켜다', 'pastDaga', '켰다가'],
];

describe('формы 3급: юниты 4–6', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    if (f !== 'eum') {
      const d = conjDistractors(v, f);
      expect(d.length).toBeGreaterThanOrEqual(1);
      expect(d).not.toContain(want);
    }
  });
});
