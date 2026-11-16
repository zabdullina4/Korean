import { describe, expect, it } from 'vitest';
import { assignSlots } from './CampusScene';

describe('раскладка кампуса', () => {
  it('текущий класс всегда в центре переднего плана', () => {
    for (let g = 0; g <= 6; g++) expect(assignSlots(g).main).toBe(`g${g}`);
  });
  it('все семь классов на карте ровно по одному разу', () => {
    for (let g = 0; g <= 6; g++) {
      const s = assignSlots(g);
      const ids = [s.main, s.prev, s.old, s.back0, s.back1, s.back2, s.back3];
      expect(new Set(ids).size).toBe(7);
    }
  });
  it('слева впереди — последний пройденный класс, а у новичка — следующий', () => {
    expect(assignSlots(3).prev).toBe('g2');
    expect(assignSlots(0).prev).toBe('g1');
  });
});
