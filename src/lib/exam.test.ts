import { describe, expect, it } from 'vitest';
import { prepExam } from '../content/exams/prep';
import { questionCount } from '../content/exam';
import { answerNote, createNote } from './notebook';
import { grade, isRight, retakeStatus, seedFor, type Answer } from './exam';

const perfect = (seed: number): Answer[][] =>
  prepExam.make(seed).map((s) => s.questions.map((q) => (q.kind === 'choice' ? q.item.answer : q.kind === 'spell' ? q.item.target : '')));

describe('экзамен 예비반', () => {
  it('25 заданий в трёх разделах, все решаемы', () => {
    const secs = prepExam.make(seedFor(prepExam.id, 0));
    expect(secs.map((s) => s.questions.length)).toEqual([10, 10, 5]);
    expect(questionCount(secs)).toBe(25);
    for (const s of secs)
      for (const q of s.questions)
        if (q.kind === 'choice') expect(q.item.options[q.item.answer]).toBeDefined();
        else if (q.kind === 'spell') for (const t of q.item.target) expect(q.item.pool).toContain(t);
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

import { TOPIK1_BANKS, topik1Exam } from '../content/exams/topik1';

describe('экзамен 1급 · TOPIK I', () => {
  it('во всех банках по 4 разных варианта, правильный — первый', () => {
    for (const [name, bank] of Object.entries(TOPIK1_BANKS))
      for (const [, opts] of bank) {
        expect(opts, name).toHaveLength(4);
        expect(new Set(opts).size, `${name}: ${opts.join(' / ')}`).toBe(4);
      }
  });

  it('15 заданий на аудирование и 20 на чтение, ответ сохраняется после перемешивания', () => {
    for (let a = 0; a < 5; a++) {
      const secs = topik1Exam.make(seedFor(topik1Exam.id, a));
      expect(secs.map((s) => s.questions.length)).toEqual([15, 20]);
      const listenAll = secs[0].questions.every((q) => q.kind === 'choice' && !!q.item.audio);
      expect(listenAll).toBe(true);
    }
    // правильный ответ после перемешивания указывает на исходный первый вариант
    const banks = Object.values(TOPIK1_BANKS).flat();
    for (const q of topik1Exam.make(7).flatMap((s) => s.questions)) {
      if (q.kind !== 'choice') continue;
      const raw = banks.find(([body]) => body === (q.item.audio ?? q.item.prompt))!;
      expect(q.item.options[q.item.answer]).toBe(raw[1][0]);
    }
  });
});

import { topik1Spec } from '../content/exams/topik1';
import { topik2Exam, topik2Spec } from '../content/exams/topik2';
import { bankSize } from '../content/exams/topik';

describe('банки TOPIK I: 1급 и 2급', () => {
  const exams = [
    { name: '1급', exam: topik1Exam, spec: topik1Spec, min: 100 },
    { name: '2급', exam: topik2Exam, spec: topik2Spec, min: 70 },
  ];
  for (const { name, exam, spec, min } of exams) {
    it(`${name}: банк не меньше ${min} заданий, без повторов текста, по 4 разных варианта`, () => {
      expect(bankSize(spec)).toBeGreaterThanOrEqual(min);
      const bodies = [...spec.listen, ...spec.read].flatMap((s) => s.bank.map((r) => r[0]));
      expect(new Set(bodies).size).toBe(bodies.length);
      for (const s of [...spec.listen, ...spec.read]) {
        expect(s.n).toBeLessThanOrEqual(s.bank.length);
        for (const [body, opts] of s.bank) {
          expect(opts, body).toHaveLength(4);
          expect(new Set(opts).size, body).toBe(4);
        }
      }
    });

    it(`${name}: 15 + 20 заданий, ответ не теряется при перемешивании`, () => {
      const banks = [...spec.listen, ...spec.read].flatMap((s) => s.bank);
      for (let a = 0; a < 4; a++) {
        const secs = exam.make(seedFor(exam.id, a));
        expect(secs.map((s) => s.questions.length)).toEqual([15, 20]);
        for (const q of secs.flatMap((s) => s.questions)) {
          if (q.kind !== 'choice') continue;
          const raw = banks.find(([body]) => body === (q.item.audio ?? q.item.prompt))!;
          expect(q.item.options[q.item.answer]).toBe(raw[1][0]);
        }
      }
    });

    it(`${name}: пересдачи — заметно другой вариант`, () => {
      const key = (n: number) => new Set(exam.make(seedFor(exam.id, n)).flatMap((s) => s.questions.map((q) => (q.kind === 'choice' ? (q.item.audio ?? q.item.prompt) : ''))));
      const a = key(0);
      for (const n of [1, 2]) {
        const b = key(n);
        const same = [...a].filter((x) => b.has(x)).length;
        expect(same / a.size, `попытка ${n + 1}`).toBeLessThan(0.6);
      }
    });
  }
});
