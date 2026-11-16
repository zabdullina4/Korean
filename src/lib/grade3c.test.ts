import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

const table: [string, Form, string][] = [
  ['먹다', 'gehada', '먹게 했어요'], ['쉬다', 'gehada', '쉬게 했어요'], ['기다리다', 'gehada', '기다리게 했어요'],
  ['맛있다', 'deoragoyo', '맛있더라고요'], ['많다', 'deoragoyo', '많더라고요'], ['춥다', 'deoragoyo', '춥더라고요'], ['좋다', 'deoragoyo', '좋더라고요'],
  ['오다', 'pastDeoragoyo', '왔더라고요'], ['끝나다', 'pastDeoragoyo', '끝났더라고요'],
  ['가다', 'deon', '가던'], ['먹다', 'deon', '먹던'], ['살다', 'deon', '살던'], ['듣다', 'deon', '듣던'],
  ['가다', 'pastDeon', '갔던'], ['보다', 'pastDeon', '봤던'], ['먹다', 'pastDeon', '먹었던'],
];

describe('формы 3급: юниты 7–8', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(1);
    expect(d).not.toContain(want);
  });
});
