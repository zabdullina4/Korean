import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChoiceItem, Lesson, Word } from '../content/types';
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
}

interface Actions {
  enroll(grade: number): void;
  toggleBell(): void;
  completeLesson(lesson: Lesson, score: number): void;
  recordError(lessonId: string, item: ChoiceItem, wrong: string): void;
  reviewCard(id: string, grade: Grade): void;
  answerNote(id: string, correct: boolean): void;
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

      reset: () => set({ ...initial }),
    }),
    {
      name: 'hakgyo-v1',
      version: 1,
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
