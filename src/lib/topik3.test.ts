import { describe, expect, it } from 'vitest';
import { TOPIK3, topik3Exam } from '../content/exams/topik3';
import { gradeWriting, grade, seedFor, type Answer } from './exam';
import { topikLength } from './wongoji';
import { styleIssues } from './writing';

const all = [...TOPIK3.LISTEN, ...TOPIK3.WRITE_CHOICE, ...TOPIK3.READ];

describe('экзамен 3급 · TOPIK II', () => {
  it('банки: не меньше 120 заданий, без повторов, по 4 разных варианта, хватает на выборку', () => {
    const bodies = all.flatMap((s) => s.bank.map((r) => r[0]));
    expect(bodies.length + TOPIK3.W53.length).toBeGreaterThanOrEqual(120);
    expect(new Set(bodies).size).toBe(bodies.length);
    for (const s of all) {
      expect(s.n).toBeLessThanOrEqual(s.bank.length);
      for (const [body, opts] of s.bank) {
        expect(opts, body).toHaveLength(4);
        expect(new Set(opts).size, body).toBe(4);
      }
    }
  });

  it('образцы задания 53: объём, 한다체 и все ключевые данные', () => {
    for (const w of TOPIK3.W53) {
      const n = topikLength(w.model);
      expect(n).toBeGreaterThanOrEqual(w.min);
      expect(n).toBeLessThanOrEqual(w.max);
      expect(styleIssues(w.model)).toEqual([]);
      expect(gradeWriting(w, w.model, 30).earned).toBe(30);
    }
  });

  it('структура: 듣기 15, 쓰기 3 (51, 52, 53), 읽기 20', () => {
    const secs = topik3Exam.make(seedFor(topik3Exam.id, 0));
    expect(secs.map((s) => s.key)).toEqual(['listen', 'write', 'read']);
    expect(secs.map((s) => s.questions.length)).toEqual([15, 3, 20]);
    expect(secs[1].questions.map((q) => q.points)).toEqual([10, 10, 30]);
  });

  it('идеальная работа — 300, без задания 53 — 240', () => {
    const seed = seedFor(topik3Exam.id, 0);
    const secs = topik3Exam.make(seed);
    const model = secs[1].questions[2].kind === 'write' ? secs[1].questions[2].item.model : '';
    const perfect: Answer[][] = secs.map((s) => s.questions.map((q) => (q.kind === 'choice' ? q.item.answer : q.kind === 'write' ? model : null)));
    const g = grade(topik3Exam, seed, secs, perfect);
    expect(g.attempt).toMatchObject({ correct: 300, total: 300, passed: true });
    expect(g.writing[0].earned).toBe(30);

    const noWrite = perfect.map((row, si) => (si === 1 ? row.map((a, qi) => (qi === 2 ? '' : a)) : row));
    const g2 = grade(topik3Exam, seed, secs, noWrite);
    expect(g2.attempt.correct).toBe(240);
    // 240/300 ≥ 210, но письмо обязательно (minWriting): без задания 53 — 불합격.
    expect(g2.attempt).toMatchObject({ passed: false, writingShort: true });
    expect(g2.writing[0].notes[0]).toMatch(/не написан/);
  });

  it('задание 53: 10 из 30 — достаточно, меньше — 불합격 при любом итоге', () => {
    const seed = seedFor(topik3Exam.id, 0);
    const secs = topik3Exam.make(seed);
    const w = secs[1].questions[2];
    if (w.kind !== 'write') throw new Error('нет задания 53');
    const answer = (text: string): Answer[][] =>
      secs.map((s, si) => s.questions.map((q, qi) => (si === 1 && qi === 2 ? text : q.kind === 'choice' ? q.item.answer : null)));
    // Отписка: одна разговорная фраза без данных из условия.
    const short = '잘 모르겠어요.';
    const gs = grade(topik3Exam, seed, secs, answer(short));
    expect(gs.writing[0].earned).toBeLessThan(10);
    expect(gs.attempt.passed).toBe(false);
    // Образец без ключевых чисел: объём и стиль есть — проходит.
    const vague = w.item.model.replace(/\d[\d,]*%?/g, '몇');
    const gv = grade(topik3Exam, seed, secs, answer(vague));
    expect(gv.writing[0].earned).toBeGreaterThanOrEqual(10);
    expect(gv.attempt).toMatchObject({ passed: true });
    expect(gv.attempt.writingShort).toBeUndefined();
  });

  it('автооценка письма: разговорный стиль и пропущенные данные снижают балл', () => {
    const w = TOPIK3.W53[0];
    const bad = w.model.replace(/하였다\./g, '했어요.').replace('45%', '절반');
    const s = gradeWriting(w, bad, 30);
    expect(s.earned).toBeLessThan(30);
    expect(s.notes.join(' ')).toMatch(/45%/);
  });
});
