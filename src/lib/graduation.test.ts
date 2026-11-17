import { describe, expect, it } from 'vitest';
import { GRADES } from '../content/catalog';
import { diplomaRows, skillProfile, topik2Level } from './graduation';
import type { ExamAttempt } from './exam';

const att = (correct: number, total: number, passed: boolean, sections: ExamAttempt['sections'] = []): ExamAttempt => ({ at: '2026-05-01T10:00:00', seed: 1, correct, total, passed, sections, wrongNoteIds: [] });

describe('аттестат выпускника', () => {
  it('строка на каждый класс, лучший сданный балл в шкале экзамена', () => {
    const rows = diplomaRows({
      lessons: {},
      graduated: '2026-05-01T10:00:00',
      exams: { 'exam-g6': [att(200, 300, false), att(250, 300, true), att(240, 300, true)], 'exam-g1': [att(150, 200, true)] },
    });
    expect(rows).toHaveLength(GRADES.length);
    expect(rows[0].name).toBe('예비반');
    expect(rows[6]).toMatchObject({ score: 250, scale: 300 });
    expect(rows[1]).toMatchObject({ score: 150, scale: 200 });
    expect(rows[2].score).toBeNull();
    expect(rows[6].lessonsTotal).toBe(20);
  });

  it('навыки: средняя доля верного по разделу в сданных экзаменах', () => {
    const p = skillProfile({
      lessons: {},
      graduated: null,
      exams: {
        'exam-g5': [att(1, 1, true, [{ key: 'listen', right: 8, total: 10 }, { key: 'write', right: 5, total: 10 }])],
        'exam-g6': [att(1, 1, true, [{ key: 'listen', right: 10, total: 10 }]), att(1, 1, false, [{ key: 'read', right: 1, total: 10 }])],
      },
    });
    expect(p).toEqual({ listen: 90, write: 50, read: null });
  });

  it('уровни TOPIK II', () => {
    expect([119, 120, 150, 190, 229, 230].map(topik2Level)).toEqual([0, 3, 4, 5, 5, 6]);
  });
});
