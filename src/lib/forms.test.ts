import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';
import { clock, native, nativeCounter } from './numbers';

const table: [string, Partial<Record<Form, string>>][] = [
  ['가다', { past: '갔어요', formal: '갑니다', formalQ: '갑니까', seyo: '가세요', future: '갈 거예요', lkkayo: '갈까요', want: '가고 싶어요', an: '안 가요', ji: '가지 않아요' }],
  ['먹다', { past: '먹었어요', formal: '먹습니다', formalQ: '먹습니까', seyo: '먹으세요', future: '먹을 거예요', lkkayo: '먹을까요', want: '먹고 싶어요', an: '안 먹어요' }],
  ['하다', { past: '했어요', formal: '합니다', seyo: '하세요', future: '할 거예요' }],
  ['공부하다', { past: '공부했어요', an: '공부 안 해요', formal: '공부합니다' }],
  ['좋아하다', { an: '안 좋아해요' }],
  ['마시다', { past: '마셨어요', seyo: '마시세요', future: '마실 거예요' }],
  ['배우다', { past: '배웠어요', formal: '배웁니다' }],
  ['오다', { past: '왔어요', lkkayo: '올까요' }],
  ['살다', { past: '살았어요', formal: '삽니다', formalQ: '삽니까', seyo: '사세요', future: '살 거예요', lkkayo: '살까요' }],
  ['만들다', { seyo: '만드세요', formal: '만듭니다', future: '만들 거예요' }],
  ['듣다', { past: '들었어요', seyo: '들으세요', future: '들을 거예요', formal: '듣습니다' }],
  ['걷다', { lkkayo: '걸을까요' }],
  ['돕다', { past: '도왔어요', seyo: '도우세요', future: '도울 거예요', formal: '돕습니다' }],
  ['춥다', { past: '추웠어요' }],
  ['읽다', { seyo: '읽으세요', formal: '읽습니다', lkkayo: '읽을까요' }],
  ['모르다', { past: '몰랐어요' }],
  ['쓰다', { past: '썼어요', seyo: '쓰세요' }],
  ['기다리다', { past: '기다렸어요', seyo: '기다리세요' }],
];

describe('формы глаголов 1급', () => {
  for (const [v, forms] of table)
    for (const [f, want] of Object.entries(forms))
      it(`${v} · ${f} → ${want}`, () => {
        expect(conj(v, f as Form)).toBe(want);
        const d = conjDistractors(v, f as Form);
        expect(d.length).toBeGreaterThanOrEqual(1);
        expect(d).not.toContain(want);
      });
});

describe('исконные числа и время', () => {
  it.each([[1, '하나'], [4, '넷'], [10, '열'], [20, '스물'], [25, '스물다섯'], [99, '아흔아홉']] as const)('%i → %s', (n, w) => expect(native(n)).toBe(w));
  it.each([[1, '한'], [2, '두'], [3, '세'], [4, '네'], [20, '스무'], [21, '스물한'], [5, '다섯']] as const)('счётная форма %i → %s', (n, w) => expect(nativeCounter(n)).toBe(w));
  it('часы', () => {
    expect(clock(3, 30)).toBe('세 시 삼십 분');
    expect(clock(12, 0)).toBe('열두 시');
    expect(clock(13, 5)).toBe('한 시 오 분');
  });
});
