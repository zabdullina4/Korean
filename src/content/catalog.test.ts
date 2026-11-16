import { describe, expect, it } from 'vitest';
import { compose } from '../lib/hangul';
import { GRADES, LESSONS } from './catalog';

describe('контент', () => {
  it('у всех уроков уникальные id и есть шаги', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    expect(ids.size).toBe(LESSONS.length);
    for (const l of LESSONS) expect(l.steps.length).toBeGreaterThan(0);
  });

  it('1급 заполнен: 10 юнитов, в каждом есть уроки', () => {
    const g1 = GRADES[1];
    expect(g1.units).toHaveLength(10);
    for (const u of g1.units) expect(u.lessons.length, u.title).toBeGreaterThan(0);
  });

  it('2급: 10 юнитов в программе, все юниты заполнены', () => {
    const g2 = GRADES[2];
    expect(g2.units).toHaveLength(10);
    for (const u of g2.units) expect(u.lessons.length, u.title).toBeGreaterThan(0);
  });

  it('все уроки из программы существуют', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    for (const g of GRADES) for (const u of g.units) for (const id of u.lessons) expect(ids.has(id)).toBe(true);
  });

  it('ответы в заданиях указывают на существующий вариант', () => {
    for (const l of LESSONS)
      for (const s of l.steps)
        if (s.kind === 'choice')
          for (const it of s.items) {
            expect(it.options[it.answer], `${l.id}: ${it.prompt}`).toBeDefined();
            expect(it.options.length, `${l.id}: ${it.prompt}`).toBeGreaterThanOrEqual(2);
            expect(new Set(it.options).size, `${l.id}: ${it.prompt} — повтор вариантов`).toBe(it.options.length);
          }
  });

  it('сборка предложений решаема из доступных блоков', () => {
    for (const l of LESSONS)
      for (const s of l.steps)
        if (s.kind === 'build') for (const t of s.target) expect(s.pool, l.id).toContain(t);
  });

  it('каждый слог в заданиях «Соберите слог» собирается из палитры', () => {
    for (const l of LESSONS)
      for (const s of l.steps) {
        if (s.kind !== 'compose') continue;
        for (const t of s.tasks) {
          const ok = s.palette.cho.some((c) => s.palette.jung.some((j) => [...(s.palette.jong ?? []), ''].some((f) => compose(c, j, f) === t.target)));
          expect(ok, `${l.id}: ${t.target}`).toBe(true);
        }
      }
  });
});
