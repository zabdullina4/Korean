import { describe, expect, it } from 'vitest';
import { prepExam } from '../content/exams/prep';
import { questionCount } from '../content/exam';
import { answerNote, createNote } from './notebook';
import { grade, isRight, retakeStatus, seedFor, type Answer } from './exam';

const perfect = (seed: number): Answer[][] =>
  prepExam.make(seed).map((s) => s.questions.map((q) => (q.kind === 'choice' ? q.item.answer : q.item.target)));

describe('экзамен 예비반', () => {
  it('25 заданий в трёх разделах, все решаемы', () => {
    const secs = prepExam.make(seedFor(prepExam.id, 0));
    expect(secs.map((s) => s.questions.length)).toEqual([10, 10, 5]);
    expect(questionCount(secs)).toBe(25);
    for (const s of secs)
      for (const q of s.questions)
        if (q.kind === 'choice') expect(q.item.options[q.item.answer]).toBeDefined();
        else for (const t of q.item.target) expect(q.item.pool).toContain(t);
  });

  it('вариант детерминирован, а пересдача — другой вариант', () => {
    const a = JSON.stringify(prepExam.make(seedFor(prepExam.id, 0)));
    expect(JSON.stringify(prepExam.make(seedFor(prepExam.id, 0)))).toBe(a);
    expect(JSON.stringify(prepExam.make(seedFor(prepExam.id, 1)))).not.toBe(a);
  });

  it('проверка и порог 80%', () => {
    const seed = seedFor(prepExam.id, 0);
    const secs = prepExam.make(seed);
    expect(grade(prepExam, seed, secs, perfect(seed)).attempt).toMatchObject({ correct: 25, passed: true });
    const answers = perfect(seed);
    for (let i = 0; i < 6; i++) answers[0][i] = null; // 6 пропусков в аудировании → 19/25 = 76%
    const g = grade(prepExam, seed, secs, answers);
    expect(g.attempt).toMatchObject({ correct: 19, passed: false });
    expect(g.mistakes).toHaveLength(6);
    expect(isRight(secs[2].questions[0], ['x'])).toBe(false);
  });

  it('пересдача — после отработки всех ошибок', () => {
    const seed = seedFor(prepExam.id, 0);
    const secs = prepExam.make(seed);
    const answers = perfect(seed);
    answers[0][0] = null;
    const now = new Date('2026-03-02T10:00:00Z');
    const g = grade(prepExam, seed, secs, answers, now);
    const n = createNote(prepExam.id, g.mistakes[0].item, '—', now);
    const notes = { [n.id]: n };
    expect(retakeStatus({ ...g.attempt, passed: false }, notes)).toEqual({ ok: false, left: 1 });
    const answered = answerNote(n, true, new Date('2026-03-02T10:05:00Z'));
    expect(retakeStatus({ ...g.attempt, passed: false }, { [n.id]: answered }).ok).toBe(true);
  });
});
