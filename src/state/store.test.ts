import { describe, expect, it } from 'vitest';
import { prepExam } from '../content/exams/prep';
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
});
