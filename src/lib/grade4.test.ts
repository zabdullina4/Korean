import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

// 4급, юнит 1 — уступка.
const table: [string, Form, string][] = [
  ['비싸다', 'ado', '비싸도'], ['바쁘다', 'ado', '바빠도'], ['듣다', 'ado', '들어도'], ['먹다', 'ado', '먹어도'], ['힘들다', 'ado', '힘들어도'], ['하다', 'ado', '해도'],
  ['오다', 'deorado', '오더라도'], ['늦다', 'deorado', '늦더라도'], ['힘들다', 'deorado', '힘들더라도'], ['춥다', 'deorado', '춥더라도'],
  ['가다', 'ljirado', '갈지라도'], ['먹다', 'ljirado', '먹을지라도'], ['어렵다', 'ljirado', '어려울지라도'], ['힘들다', 'ljirado', '힘들지라도'], ['실패하다', 'ljirado', '실패할지라도'],
  ['먹다', 'neundedoV', '먹는데도'], ['자다', 'neundedoV', '자는데도'], ['살다', 'neundedoV', '사는데도'], ['듣다', 'neundedoV', '듣는데도'],
  ['춥다', 'neundedoA', '추운데도'], ['바쁘다', 'neundedoA', '바쁜데도'], ['맛있다', 'neundedoA', '맛있는데도'], ['멀다', 'neundedoA', '먼데도'], ['작다', 'neundedoA', '작은데도'],
  ['공부하다', 'pastNeundedo', '공부했는데도'], ['먹다', 'pastNeundedo', '먹었는데도'], ['자다', 'pastNeundedo', '잤는데도'],
];

describe('формы 4급: уступка', () => {
  it.each(table)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });

  it('ловушки не совпадают с другими верными формами уступки', () => {
    const valid = (v: string, f: Form) => (['ado', 'deorado', 'ljirado', f === 'neundedoA' ? 'neundedoA' : 'neundedoV', 'pastNeundedo'] as Form[]).map((x) => conj(v, x));
    for (const [v, f] of table) {
      const ok = new Set([...valid(v, f), conj(v, 'past').slice(0, -2) + '어도', conj(v, 'past').slice(0, -2) + '더라도']);
      for (const d of conjDistractors(v, f)) expect(ok.has(d), `${v} ${f}: ${d}`).toBe(false);
    }
  });
});

// 4급, юнит 2 — противопоставление.
const table2: [string, Form, string][] = [
  ['가다', 'banmyeonV', '가는 반면에'], ['먹다', 'banmyeonV', '먹는 반면에'], ['살다', 'banmyeonV', '사는 반면에'], ['좋아하다', 'banmyeonV', '좋아하는 반면에'],
  ['비싸다', 'banmyeonA', '비싼 반면에'], ['좁다', 'banmyeonA', '좁은 반면에'], ['춥다', 'banmyeonA', '추운 반면에'], ['맛있다', 'banmyeonA', '맛있는 반면에'], ['멀다', 'banmyeonA', '먼 반면에'],
  ['오르다', 'pastBanmyeon', '오른 반면에'], ['늘다', 'pastBanmyeon', '는 반면에'], ['줄다', 'pastBanmyeon', '준 반면에'], ['먹다', 'pastBanmyeon', '먹은 반면에'],
  ['살다', 'debanhaeV', '사는데 반해'], ['먹다', 'debanhaeV', '먹는데 반해'], ['자다', 'debanhaeV', '자는데 반해'],
  ['조용하다', 'debanhaeA', '조용한데 반해'], ['넓다', 'debanhaeA', '넓은데 반해'], ['재미있다', 'debanhaeA', '재미있는데 반해'],
  ['맛있다', 'gineun', '맛있기는 하지만'], ['비싸다', 'gineun', '비싸기는 하지만'], ['가다', 'gineun', '가기는 하지만'], ['듣다', 'gineun', '듣기는 하지만'],
  ['읽다', 'pastGineun', '읽기는 했지만'], ['가다', 'pastGineun', '가기는 했지만'],
];

describe('формы 4급: противопоставление', () => {
  it.each(table2)('%s · %s → %s', (v, f, want) => {
    expect(conj(v, f)).toBe(want);
    const d = conjDistractors(v, f);
    expect(d.length).toBeGreaterThanOrEqual(2);
    expect(d).not.toContain(want);
  });

  it('ловушки не совпадают с другими верными формами', () => {
    for (const [v, f] of table2) {
      const verbish = f !== 'banmyeonA' && f !== 'debanhaeA';
      const ok = new Set(
        (verbish ? ['banmyeonV', 'pastBanmyeon', 'debanhaeV', 'gineun', 'pastGineun'] : ['banmyeonA', 'debanhaeA', 'gineun', 'pastGineun']).map((x) => conj(v, x as Form)),
      );
      for (const d of conjDistractors(v, f)) expect(ok.has(d), `${v} ${f}: ${d}`).toBe(false);
    }
  });
});
