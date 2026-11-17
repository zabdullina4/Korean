import { describe, expect, it } from 'vitest';
import { formatInterval, isDue, isMature, newFsrs, preview, Rating, review, State } from './srs';

const day = 86400000;

describe('srs', () => {
  it('новая карточка не считается «к повторению»', () => {
    const c = newFsrs(new Date('2026-01-01'));
    expect(c.state).toBe(State.New);
    expect(isDue(c, new Date('2026-01-01'))).toBe(false);
  });

  it('хорошие ответы раздвигают интервалы', () => {
    let now = new Date('2026-01-01T10:00:00Z');
    let c = newFsrs(now);
    const gaps: number[] = [];
    for (let i = 0; i < 5; i++) {
      c = review(c, Rating.Good, now);
      const due = new Date(c.due);
      gaps.push(due.getTime() - now.getTime());
      now = due;
    }
    expect(gaps[4]).toBeGreaterThan(gaps[2]);
    expect(gaps[4]).toBeGreaterThan(7 * day);
    expect(JSON.parse(JSON.stringify(c))).toEqual(c); // переживает сериализацию
  });

  it('«Снова» короче, чем «Легко»', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const p = preview(newFsrs(now), now);
    expect(p[Rating.Again].getTime()).toBeLessThan(p[Rating.Easy].getTime());
  });

  it('зрелость и форматирование', () => {
    expect(isMature({ ...newFsrs(), state: State.Review, stability: 30 })).toBe(true);
    const now = new Date('2026-01-01T00:00:00Z');
    expect(formatInterval(new Date(now.getTime() + 10 * 60000), now)).toBe('10 мин');
    expect(formatInterval(new Date(now.getTime() + 3 * day), now)).toBe('3 дн');
  });
});
