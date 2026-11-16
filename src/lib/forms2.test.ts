import { describe, expect, it } from 'vitest';
import { conj, conjDistractors, type Form } from './conjugate';

const table: [string, Partial<Record<Form, string>>][] = [
  ['가다', { tryPast: '가 봤어요', experience: '간 적이 있어요', can: '갈 수 있어요', cannot: '갈 수 없어요', must: '가야 해요', progressive: '가고 있어요', jiman: '가지만', myeon: '가면', reo: '가러 가요', ryeogo: '가려고 해요', giro: '가기로 했어요' }],
  ['먹다', { tryPast: '먹어 봤어요', trySeyo: '먹어 보세요', experience: '먹은 적이 있어요', can: '먹을 수 있어요', must: '먹어야 해요', myeon: '먹으면', reo: '먹으러 가요', ryeogo: '먹으려고 해요' }],
  ['하다', { tryPast: '해 봤어요', experience: '한 적이 있어요', can: '할 수 있어요', must: '해야 해요', myeon: '하면', reo: '하러 가요' }],
  ['듣다', { tryPast: '들어 봤어요', experience: '들은 적이 있어요', can: '들을 수 있어요', must: '들어야 해요', progressive: '듣고 있어요', myeon: '들으면', reo: '들으러 가요', ryeogo: '들으려고 해요' }],
  ['만들다', { tryPast: '만들어 봤어요', experience: '만든 적이 있어요', can: '만들 수 있어요', myeon: '만들면', reo: '만들러 가요', ryeogo: '만들려고 해요' }],
  ['돕다', { tryPast: '도와 봤어요', experience: '도운 적이 있어요', can: '도울 수 있어요', must: '도와야 해요', myeon: '도우면', reo: '도우러 가요' }],
  ['살다', { experience: '산 적이 있어요', can: '살 수 있어요', myeon: '살면' }],
  ['입다', { tryPast: '입어 봤어요', experience: '입은 적이 있어요' }],
  ['마시다', { tryPast: '마셔 봤어요', must: '마셔야 해요' }],
  ['쓰다', { must: '써야 해요', jiman: '쓰지만' }],
  ['보다', { tryPast: '봐 봤어요', experience: '본 적이 있어요' }],
];

describe('формы 2급', () => {
  for (const [v, forms] of table)
    for (const [f, want] of Object.entries(forms))
      it(`${v} · ${f} → ${want}`, () => {
        expect(conj(v, f as Form)).toBe(want);
        const d = conjDistractors(v, f as Form);
        expect(d.length).toBeGreaterThanOrEqual(1);
        expect(d).not.toContain(want);
      });
});
