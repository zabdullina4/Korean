import { describe, expect, it } from 'vitest';
import { TOPIK6, topik6Exam } from '../content/exams/topik6';
import { gradeWriting, grade, seedFor, type Answer } from './exam';
import { topikLength } from './wongoji';
import { styleIssues } from './writing';

const all = [...TOPIK6.LISTEN, ...TOPIK6.WRITE_CHOICE, ...TOPIK6.READ];

describe('экзамен 6급 · TOPIK II', () => {
  it('банки: не меньше 100 заданий, без повторов, по 4 разных варианта', () => {
    const bodies = all.flatMap((s) => s.bank.map((r) => r[0]));
    expect(bodies.length + TOPIK6.W53.length + TOPIK6.W54.length).toBeGreaterThanOrEqual(100);
    expect(new Set(bodies).size).toBe(bodies.length);
    for (const s of all) {
      expect(s.n).toBeLessThanOrEqual(s.bank.length);
      for (const [body, opts] of s.bank) {
        expect(opts, body).toHaveLength(4);
        expect(new Set(opts).size, body).toBe(4);
      }
    }
  });

  it('образцы 53 и 54: объём, 한다체, все данные и полный балл', () => {
    for (const w of [...TOPIK6.W53, ...TOPIK6.W54]) {
      const n = topikLength(w.model);
      expect(n, w.task.slice(0, 30)).toBeGreaterThanOrEqual(w.min);
      expect(n, w.task.slice(0, 30)).toBeLessThanOrEqual(w.max);
      expect(styleIssues(w.model)).toEqual([]);
      const max = w.structure ? 50 : 30;
      const g = gradeWriting(w, w.model, max);
      expect(g.earned, g.notes.join(' ')).toBe(max);
    }
  });

  it('проверка стиля: «아니다» — это 한다체, а «아닙니다» и «합니다» — нет', () => {
    expect(styleIssues('그것은 사실이 아니다.')).toEqual([]);
    expect(styleIssues('그것은 사실이 아닙니다.')).toHaveLength(1);
    expect(styleIssues('공부를 합니다.')).toHaveLength(1);
  });

  it('структура: 듣기 15, 쓰기 4 (51–54: 10, 10, 30, 50), 읽기 20', () => {
    const secs = topik6Exam.make(seedFor(topik6Exam.id, 0));
    expect(secs.map((s) => s.key)).toEqual(['listen', 'write', 'read']);
    expect(secs.map((s) => s.questions.length)).toEqual([15, 4, 20]);
    expect(secs[1].questions.map((q) => q.points)).toEqual([10, 10, 30, 50]);
  });

  it('зачёт — 230 из 300, как порог 6급 настоящего TOPIK II', () => {
    expect(Math.round(topik6Exam.pass * 300)).toBe(230);
    expect(TOPIK6.CONNECTIVES.length).toBeGreaterThanOrEqual(15);
  });

  it('идеальная работа — 300; без эссе 54 итог 250, но экзамен не сдан', () => {
    const seed = seedFor(topik6Exam.id, 0);
    const secs = topik6Exam.make(seed);
    const perfect: Answer[][] = secs.map((s) => s.questions.map((q) => (q.kind === 'choice' ? q.item.answer : q.kind === 'write' ? q.item.model : null)));
    const g = grade(topik6Exam, seed, secs, perfect);
    expect(g.attempt).toMatchObject({ correct: 300, total: 300, passed: true });
    const noEssay = perfect.map((row, si) => (si === 1 ? row.map((a, qi) => (qi === 3 ? '' : a)) : row));
    const g2 = grade(topik6Exam, seed, secs, noEssay);
    expect(g2.attempt.correct).toBe(250);
    expect(g2.attempt).toMatchObject({ passed: false, writingShort: true });
    // Пустая работа — провал по баллам, без пометки о письме.
    const empty: Answer[][] = secs.map((s) => s.questions.map(() => null));
    const g3 = grade(topik6Exam, seed, secs, empty);
    expect(g3.attempt.passed).toBe(false);
    expect(g3.attempt.writingShort).toBeUndefined();
  });

  it('эссе: один абзац и без связок теряет баллы за строение', () => {
    const w = TOPIK6.W54[0];
    const flat = w.model.replace(/\n/g, ' ');
    const s1 = gradeWriting(w, flat, 50);
    expect(s1.earned).toBeLessThan(50);
    expect(s1.notes.join(' ')).toMatch(/Абзацев: 1/);
    let bare = w.model;
    for (const c of TOPIK6.CONNECTIVES) bare = bare.split(c).join('');
    const s2 = gradeWriting(w, bare, 50);
    expect(s2.notes.join(' ')).toMatch(/связок: 0/);
    expect(s2.earned).toBeLessThan(50);
  });

  it('короткий ответ «по галочкам» не проходит минимум за эссе', () => {
    const w = TOPIK6.W54[0];
    const tiny = '칭찬은 중요하다. 우선 자신감이 생긴다.\n그러나 지나친 칭찬은 부담이 된다.\n따라서 과정을 칭찬해야 한다. 이처럼 칭찬은 힘이 된다.';
    const g = gradeWriting(w, tiny, 50);
    expect(g.earned).toBeLessThan(50 / 3);
  });

  it('пересдачи — заметно другой вариант', () => {
    const key = (n: number) => new Set(topik6Exam.make(seedFor(topik6Exam.id, n)).flatMap((s) => s.questions.map((q) => (q.kind === 'choice' ? (q.item.audio ?? q.item.prompt) : q.kind === 'write' ? q.item.task : ''))));
    const a = key(0);
    for (const n of [1, 2]) {
      const b = key(n);
      const same = [...a].filter((x) => b.has(x)).length;
      expect(same / a.size, `попытка ${n + 1}`).toBeLessThan(0.6);
    }
  });
});
