import { describe, expect, it } from 'vitest';
import { prepExam } from '../content/exams/prep';
import { topik6Exam } from '../content/exams/topik6';
import { grade, seedFor } from '../lib/exam';
import { useSchool } from './store';

describe('store: экзамен и перевод', () => {
  it('провал записывает ошибки, сдача переводит в следующий класс', () => {
    useSchool.getState().reset();
    useSchool.getState().enroll(0);
    const seed = seedFor(prepExam.id, 0);
    const secs = prepExam.make(seed);
    const blank = secs.map((s) => s.questions.map(() => null));
    useSchool.getState().finishExam(prepExam.id, 0, grade(prepExam, seed, secs, blank));
    let st = useSchool.getState();
    expect(st.grade).toBe(0);
    expect(Object.keys(st.notes)).toHaveLength(25);

    const perfect = secs.map((s) => s.questions.map((q) => (q.kind === 'choice' ? q.item.answer : q.kind === 'spell' ? q.item.target : '')));
    useSchool.getState().finishExam(prepExam.id, 0, grade(prepExam, seed, secs, perfect));
    st = useSchool.getState();
    expect(st.grade).toBe(1);
    expect(st.promoted).toBe(1);
    expect(st.exams[prepExam.id]).toHaveLength(2);
  });

  it('сдача выпускного экзамена 6급: класс не меняется, ученик становится выпускником', () => {
    useSchool.getState().reset();
    useSchool.getState().enroll(6);
    const seed = seedFor(topik6Exam.id, 0);
    const secs = topik6Exam.make(seed);
    const perfect = secs.map((s) => s.questions.map((q) => (q.kind === 'choice' ? q.item.answer : q.kind === 'write' ? q.item.model : null)));
    useSchool.getState().finishExam(topik6Exam.id, 6, grade(topik6Exam, seed, secs, perfect));
    const st = useSchool.getState();
    expect(st.grade).toBe(6);
    expect(st.promoted).toBeNull();
    expect(st.graduated).toBe(st.exams[topik6Exam.id][0].at);
    // Повторная сдача не переписывает дату выпуска.
    useSchool.getState().finishExam(topik6Exam.id, 6, grade(topik6Exam, seed, secs, perfect, new Date('2030-01-01')));
    expect(useSchool.getState().graduated).toBe(st.graduated);
  });
});
