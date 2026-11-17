import { describe, expect, it } from 'vitest';
import { gradeLessons } from '../content/catalog';
import type { SchoolState } from '../state/store';
import { createNote } from './notebook';
import { buildDay, reviewQueue, stats } from './plan';
import { newFsrs, Rating, review } from './srs';

const empty: SchoolState = { enrolled: true, grade: 0, bell: true, lessons: {}, words: {}, cards: {}, notes: {}, attendance: [], reviewsByDay: {}, newByDay: {}, exams: {}, promoted: null, graduated: null };
const now = new Date('2026-03-02T09:00:00');

describe('учебный день', () => {
  it('новичок начинает с первого урока', () => {
    const day = buildDay(empty, now);
    const l1 = day.find((s) => s.per === '1교시')!;
    expect(l1.status).toBe('next');
    expect(l1.action).toEqual({ type: 'lesson', lessonId: gradeLessons(0)[0].id });
    expect(day.find((s) => s.per === '조회')!.status).toBe('done');
  });

  it('пройденный сегодня урок остаётся в расписании зачёркнутым, следующий становится 2교시', () => {
    const [a, b] = gradeLessons(0);
    const day = buildDay({ ...empty, lessons: { [a.id]: { completedAt: now.toISOString(), score: 90, attempts: 1 } } }, now);
    expect(day[1]).toMatchObject({ status: 'done', action: { lessonId: a.id } });
    expect(day[2]).toMatchObject({ status: 'next', action: { lessonId: b.id } });
  });

  it('повторения идут первыми, новых карточек не больше лимита', () => {
    const cards: SchoolState['cards'] = {};
    for (let i = 0; i < 15; i++) cards[`n${i}`] = { id: `n${i}`, wordId: `w${i}`, dir: 'kr-ru', fsrs: newFsrs(now) };
    const old = review(newFsrs(new Date('2026-02-01')), Rating.Good, new Date('2026-02-01'));
    cards.old = { id: 'old', wordId: 'wo', dir: 'kr-ru', fsrs: old };
    const s = { ...empty, cards };
    const q = reviewQueue(s, now);
    expect(q.due.map((c) => c.id)).toEqual(['old']);
    expect(q.fresh).toHaveLength(10);
    expect(buildDay(s, now)[0].status).toBe('next');
  });

  it('종례 активен, когда есть записи на сегодня', () => {
    const n = createNote('l', { prompt: 'x', options: ['a', 'b'], answer: 0, why: '', errorType: 'letter' }, 'b', new Date('2026-03-01T09:00:00'));
    const day = buildDay({ ...empty, notes: { [n.id]: n } }, now);
    expect(day.find((s) => s.per === '종례')!.status).not.toBe('done');
  });

  it('после всех уроков класса в расписании появляется экзамен, после зачёта — исчезает', () => {
    const old = new Date('2026-02-01T09:00:00').toISOString();
    const lessons = Object.fromEntries(gradeLessons(0).map((l) => [l.id, { completedAt: old, score: 90, attempts: 1 }]));
    const day = buildDay({ ...empty, lessons }, now);
    expect(day[1]).toMatchObject({ status: 'next', action: { type: 'exam', examId: 'exam-g0' } });
    const passed = { 'exam-g0': [{ at: old, seed: 1, correct: 25, total: 25, passed: true, sections: [], wrongNoteIds: [] }] };
    expect(buildDay({ ...empty, lessons, exams: passed }, now).some((s) => s.action.type === 'exam')).toBe(false);
  });

  it('статистика зачётки', () => {
    expect(stats(empty)).toMatchObject({ words: 0, lessonsDone: 0, lessonsTotal: 6 });
  });

  it('6급: после всех уроков — выпускной экзамен, после выпуска — «Школа окончена»', () => {
    const lessons = Object.fromEntries(gradeLessons(6).map((l) => [l.id, { completedAt: '2026-01-01T09:00:00', score: 1, attempts: 1 }]));
    const g6 = { ...empty, grade: 6, lessons };
    const exam = buildDay(g6, now).find((x) => x.action.type === 'exam');
    expect(exam?.detail).toMatch(/Выпускной экзамен/);
    const passed = { ...g6, graduated: '2026-02-01T10:00:00', exams: { 'exam-g6': [{ at: '2026-02-01T10:00:00', seed: 1, correct: 280, total: 300, passed: true, sections: [], wrongNoteIds: [] }] } };
    const day = buildDay(passed, now);
    expect(day.some((x) => x.action.type === 'exam')).toBe(false);
    expect(day.find((x) => x.per === '1교시')?.title).toBe('Школа окончена');
  });
});
