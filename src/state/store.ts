import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChoiceItem, Lesson, Word } from '../content/types';
import type { ExamAttempt, Graded } from '../lib/exam';
import { answerNote, createNote, missAgain, noteKey, type ErrorNote } from '../lib/notebook';
import { newFsrs, review, State as FsrsState, type Grade, type StoredFsrs } from '../lib/srs';

export type CardDir = 'kr-ru' | 'ru-kr';

export interface CardRec {
  id: string;
  wordId: string;
  dir: CardDir;
  fsrs: StoredFsrs;
}

export interface LessonRec {
  completedAt: string;
  score: number;
  attempts: number;
}

export interface SchoolState {
  enrolled: boolean;
  grade: number;
  bell: boolean;
  lessons: Record<string, LessonRec>;
  words: Record<string, Word>;
  cards: Record<string, CardRec>;
  notes: Record<string, ErrorNote>;
  attendance: string[];
  reviewsByDay: Record<string, number>;
  newByDay: Record<string, number>;
  exams: Record<string, ExamAttempt[]>;
  /** Номер класса, в который ученик только что перешёл — для поздравления в кампусе. */
  promoted: number | null;
}

interface Actions {
  enroll(grade: number): void;
  toggleBell(): void;
  completeLesson(lesson: Lesson, score: number): void;
  recordError(lessonId: string, item: ChoiceItem, wrong: string): void;
  reviewCard(id: string, grade: Grade): void;
  answerNote(id: string, correct: boolean): void;
  finishExam(examId: string, grade: number, result: Graded): void;
  clearPromoted(): void;
  reset(): void;
}

export const NEW_CARDS_PER_DAY = 10;

export const dayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

const initial: SchoolState = {
  enrolled: false,
  grade: 0,
  bell: true,
  lessons: {},
  words: {},
  cards: {},
  notes: {},
  attendance: [],
  reviewsByDay: {},
  newByDay: {},
  exams: {},
  promoted: null,
};

const withAttendance = (s: SchoolState): Pick<SchoolState, 'attendance'> => {
  const k = dayKey();
  return { attendance: s.attendance.includes(k) ? s.attendance : [...s.attendance, k] };
};

export const useSchool = create<SchoolState & Actions>()(
  persist(
    (set) => ({
      ...initial,
      enroll: (grade) => set({ enrolled: true, grade }),
      toggleBell: () => set((s) => ({ bell: !s.bell })),

      completeLesson: (lesson, score) =>
        set((s) => {
          const prev = s.lessons[lesson.id];
          const words = { ...s.words };
          const cards = { ...s.cards };
          for (const w of lesson.words) {
            words[w.id] = w;
            for (const dir of ['kr-ru', 'ru-kr'] as CardDir[]) {
              const id = `${w.id}:${dir}`;
              if (!cards[id]) cards[id] = { id, wordId: w.id, dir, fsrs: newFsrs() };
            }
          }
          return {
            lessons: {
              ...s.lessons,
              [lesson.id]: { completedAt: new Date().toISOString(), score: Math.max(score, prev?.score ?? 0), attempts: (prev?.attempts ?? 0) + 1 },
            },
            words,
            cards,
            ...withAttendance(s),
          };
        }),

      recordError: (lessonId, item, wrong) =>
        set((s) => {
          const id = noteKey(lessonId, item);
          const prev = s.notes[id];
          return { notes: { ...s.notes, [id]: prev ? missAgain(prev, wrong) : createNote(lessonId, item, wrong) } };
        }),

      reviewCard: (id, grade) =>
        set((s) => {
          const c = s.cards[id];
          if (!c) return {};
          const k = dayKey();
          const wasNew = c.fsrs.state === FsrsState.New;
          return {
            cards: { ...s.cards, [id]: { ...c, fsrs: review(c.fsrs, grade) } },
            reviewsByDay: { ...s.reviewsByDay, [k]: (s.reviewsByDay[k] ?? 0) + 1 },
            newByDay: wasNew ? { ...s.newByDay, [k]: (s.newByDay[k] ?? 0) + 1 } : s.newByDay,
            ...withAttendance(s),
          };
        }),

      answerNote: (id, correct) =>
        set((s) => {
          const n = s.notes[id];
          if (!n) return {};
          return { notes: { ...s.notes, [id]: answerNote(n, correct) }, ...withAttendance(s) };
        }),

      finishExam: (examId, grade, { attempt, mistakes }) =>
        set((s) => {
          const notes = { ...s.notes };
          for (const m of mistakes) {
            const id = noteKey(examId, m.item);
            notes[id] = notes[id] ? missAgain(notes[id], m.wrong) : createNote(examId, m.item, m.wrong);
          }
          const promote = attempt.passed && s.grade === grade;
          return {
            notes,
            exams: { ...s.exams, [examId]: [...(s.exams[examId] ?? []), attempt] },
            grade: promote ? grade + 1 : s.grade,
            promoted: promote ? grade + 1 : s.promoted,
            ...withAttendance(s),
          };
        }),

      clearPromoted: () => set({ promoted: null }),

      reset: () => set({ ...initial }),
    }),
    {
      name: 'hakgyo-v1',
      version: 2,
      // v1 → v2: появились экзамены
      migrate: (old) => ({ ...initial, ...(old as Partial<SchoolState>) }),
      storage: createJSONStorage(() => {
        try {
          const t = '__t';
          localStorage.setItem(t, t);
          localStorage.removeItem(t);
          return localStorage;
        } catch {
          const mem = new Map<string, string>();
          return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
        }
      }),
    },
  ),
);
