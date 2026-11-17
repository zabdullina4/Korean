import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

const table: [string, Form, string][] = [
  ['아프다', 'aseo', '아파서'], ['바쁘다', 'aseo', '바빠서'], ['다치다', 'aseo', '다쳐서'], ['늦다', 'aseo', '늦어서'], ['춥다', 'aseo', '추워서'], ['오다', 'aseo', '와서'],
  ['오다', 'gittaemune', '오기 때문에'], ['피곤하다', 'gittaemune', '피곤하기 때문에'], ['아프다', 'gittaemune', '아프기 때문에'],
  ['자다', 'pastGittaemune', '잤기 때문에'], ['먹다', 'pastGittaemune', '먹었기 때문에'], ['늦다', 'pastGittaemune', '늦었기 때문에'],
  ['먹다', 'eodo', '먹어도 돼요'], ['가다', 'eodo', '가도 돼요'], ['하다', 'eodo', '해도 돼요'], ['앉다', 'eodo', '앉아도 돼요'], ['듣다', 'eodo', '들어도 돼요'],
  ['마시다', 'myeonan', '마시면 안 돼요'], ['먹다', 'myeonan', '먹으면 안 돼요'], ['피우다', 'myeonan', '피우면 안 돼요'], ['놀다', 'myeonan', '놀면 안 돼요'], ['듣다', 'myeonan', '들으면 안 돼요'],
];

describe('причины и разрешения', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(1);
    expect(d).not.toContain(want);
  });
});
