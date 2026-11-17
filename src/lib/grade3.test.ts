import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

const table: [string, Form, string][] = [
  ['가다', 'handaV', '간다'], ['먹다', 'handaV', '먹는다'], ['살다', 'handaV', '산다'], ['공부하다', 'handaV', '공부한다'], ['듣다', 'handaV', '듣는다'], ['만들다', 'handaV', '만든다'],
  ['가다', 'handaPast', '갔다'], ['먹다', 'handaPast', '먹었다'], ['하다', 'handaPast', '했다'], ['가다', 'handaFut', '갈 것이다'], ['먹다', 'handaFut', '먹을 것이다'],
  ['가다', 'indV', '간다고 했어요'], ['먹다', 'indV', '먹는다고 했어요'], ['오다', 'indV', '온다고 했어요'],
  ['바쁘다', 'indA', '바쁘다고 했어요'], ['맛있다', 'indA', '맛있다고 했어요'], ['춥다', 'indA', '춥다고 했어요'],
  ['가다', 'indPast', '갔다고 했어요'], ['먹다', 'indPast', '먹었다고 했어요'],
  ['가다', 'daeyoV', '간대요'], ['먹다', 'daeyoV', '먹는대요'], ['오다', 'daeyoV', '온대요'], ['쉬다', 'daeyoV', '쉰대요'], ['좋다', 'daeyoA', '좋대요'], ['바쁘다', 'daeyoA', '바쁘대요'],
  ['가다', 'indQ', '가냐고 했어요'], ['먹다', 'indQ', '먹냐고 했어요'], ['살다', 'indQ', '사냐고 했어요'],
  ['오다', 'indCmd', '오라고 했어요'], ['읽다', 'indCmd', '읽으라고 했어요'], ['놀다', 'indCmd', '놀라고 했어요'], ['듣다', 'indCmd', '들으라고 했어요'],
  ['가다', 'indSug', '가자고 했어요'], ['먹다', 'indSug', '먹자고 했어요'],
  ['오다', 'gotgataV', '오는 것 같아요'], ['오다', 'gotgataPast', '온 것 같아요'], ['오다', 'gotgataFut', '올 것 같아요'], ['먹다', 'gotgataPast', '먹은 것 같아요'],
  ['좋다', 'gotgataA', '좋은 것 같아요'], ['크다', 'gotgataA', '큰 것 같아요'], ['맛있다', 'gotgataA', '맛있는 것 같아요'], ['춥다', 'gotgataA', '추운 것 같아요'],
  ['오다', 'nabwayo', '오나 봐요'], ['맛있다', 'nabwayo', '맛있나 봐요'], ['살다', 'nabwayo', '사나 봐요'], ['오다', 'pastNabwayo', '왔나 봐요'], ['보다', 'pastNabwayo', '봤나 봐요'],
  ['바쁘다', 'ngabwayo', '바쁜가 봐요'], ['춥다', 'ngabwayo', '추운가 봐요'], ['좋다', 'ngabwayo', '좋은가 봐요'], ['피곤하다', 'ngabwayo', '피곤한가 봐요'],
];

describe('формы 3급', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(1);
    expect(d).not.toContain(want);
  });
});
