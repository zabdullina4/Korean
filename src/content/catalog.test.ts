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

  it('3급: все 10 юнитов заполнены', () => {
    const g3 = GRADES[3];
    expect(g3.units).toHaveLength(10);
    for (const u of g3.units) expect(u.lessons.length, u.title).toBeGreaterThan(0);
  });

  it('4급: все 10 юнитов заполнены', () => {
    const g4 = GRADES[4];
    expect(g4.units).toHaveLength(10);
    for (const u of g4.units) expect(u.lessons.length, u.title).toBeGreaterThan(0);
  });

  it('ханча: число иероглифов совпадает с числом слогов, корень входит в каждое слово', () => {
    for (const l of LESSONS)
      for (const s of l.steps)
        if (s.kind === 'hanja')
          for (const r of s.roots)
            for (const w of r.words) {
              expect([...w.hanja].length, `${w.kr} ${w.hanja}`).toBe(w.kr.length);
              const i = [...w.hanja].indexOf(r.char);
              expect(i, `${w.kr}: нет корня ${r.char}`).toBeGreaterThanOrEqual(0);
              expect(w.kr[i], `${w.kr}: ${r.char} читается ${r.sound}`).toBe(r.sound);
            }
  });

  it('образцы письменных заданий укладываются в объём и написаны в 한다체', async () => {
    const { topikLength } = await import('../lib/wongoji');
    const { styleIssues } = await import('../lib/writing');
    for (const l of LESSONS)
      for (const s of l.steps)
        if (s.kind === 'write') {
          const n = topikLength(s.model);
          expect(n, l.id).toBeGreaterThanOrEqual(s.min);
          expect(n, l.id).toBeLessThanOrEqual(s.max);
          expect(styleIssues(s.model), l.id).toEqual([]);
        }
  });

  it('слова урока не проверяются раньше, чем показаны', async () => {
    const { testedBeforeTaught } = await import('./vocab');
    for (const l of LESSONS) expect(testedBeforeTaught(l), l.id).toEqual([]);
  });

  it('в уроках с буквами новые слова идут после букв', () => {
    for (const l of LESSONS) {
      const li = l.steps.findIndex((s) => s.kind === 'letters');
      const wi = l.steps.findIndex((s) => s.kind === 'words');
      if (li >= 0 && wi >= 0) expect(wi, l.id).toBeGreaterThan(li);
    }
  });

  it('в каждом уроке со словами есть шаг «Новые слова» со всеми словами', () => {
    for (const l of LESSONS) {
      if (!l.words.length) continue;
      const st = l.steps.find((s) => s.kind === 'words');
      expect(st, l.id).toBeDefined();
      if (st?.kind === 'words') expect(st.words.map((w) => w.id).sort(), l.id).toEqual(l.words.map((w) => w.id).sort());
    }
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
