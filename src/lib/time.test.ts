import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

const table: [string, Form, string][] = [
  ['가다', 'ttae', '갈 때'], ['먹다', 'ttae', '먹을 때'], ['살다', 'ttae', '살 때'], ['듣다', 'ttae', '들을 때'], ['춥다', 'ttae', '추울 때'], ['바쁘다', 'ttae', '바쁠 때'],
  ['어리다', 'pastTtae', '어렸을 때'], ['오다', 'pastTtae', '왔을 때'], ['만나다', 'pastTtae', '만났을 때'], ['하다', 'pastTtae', '했을 때'],
  ['자다', 'jeone', '자기 전에'], ['먹다', 'jeone', '먹기 전에'], ['듣다', 'jeone', '듣기 전에'],
  ['먹다', 'hue', '먹은 후에'], ['끝나다', 'hue', '끝난 후에'], ['듣다', 'hue', '들은 후에'], ['만들다', 'hue', '만든 후에'],
  ['먹다', 'myeonseo', '먹으면서'], ['듣다', 'myeonseo', '들으면서'], ['걷다', 'myeonseo', '걸으면서'], ['마시다', 'myeonseo', '마시면서'], ['만들다', 'myeonseo', '만들면서'],
  ['자다', 'dongan', '자는 동안'], ['살다', 'dongan', '사는 동안'], ['기다리다', 'dongan', '기다리는 동안'],
];

describe('формы времени 2급', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(1);
    expect(d).not.toContain(want);
  });
});
