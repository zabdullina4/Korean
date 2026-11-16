import { describe, expect, it } from 'vitest';
import type { ChoiceItem } from '../content/types';
import { answerNote, createNote, isNoteDue, isOpen } from './notebook';

const item: ChoiceItem = { prompt: '시간이 ___ 택시를 탑시다.', options: ['없어서', '없으니까'], answer: 1, why: '', errorType: 'ending' };
const t = (s: string) => new Date(s);

describe('오답노트', () => {
  it('новая запись открывается на следующий день', () => {
    const n = createNote('l1', item, '없어서', t('2026-03-02T09:00:00Z'));
    expect(isNoteDue(n, t('2026-03-02T20:00:00Z'))).toBe(false);
    expect(isNoteDue(n, t('2026-03-03T08:00:00Z'))).toBe(true);
  });

  it('закрывается после трёх верных ответов в разные дни', () => {
    let n = createNote('l1', item, '없어서', t('2026-03-02T09:00:00Z'));
    n = answerNote(n, true, t('2026-03-03T09:00:00Z'));
    n = answerNote(n, true, t('2026-03-03T10:00:00Z')); // тот же день — не считается
    expect(n.streak).toBe(1);
    n = answerNote(n, true, t('2026-03-05T09:00:00Z'));
    expect(isOpen(n)).toBe(true);
    n = answerNote(n, true, t('2026-03-09T09:00:00Z'));
    expect(isOpen(n)).toBe(false);
  });

  it('ошибка сбрасывает серию', () => {
    let n = createNote('l1', item, '없어서', t('2026-03-02T09:00:00Z'));
    n = answerNote(n, true, t('2026-03-03T09:00:00Z'));
    n = answerNote(n, false, t('2026-03-05T09:00:00Z'));
    expect(n.streak).toBe(0);
    expect(n.misses).toBe(2);
  });
});
