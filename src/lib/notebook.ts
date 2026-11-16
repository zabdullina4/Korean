// 오답노트 — тетрадь ошибок. Запись закрывается после трёх верных ответов в разные дни.
import type { ChoiceItem, ErrorType } from '../content/types';

export const CLOSE_AFTER = 3;
/** Интервалы (в днях) после 0, 1 и 2 верных ответов подряд. */
const GAPS = [1, 2, 4];

export interface ErrorNote {
  id: string;
  lessonId: string;
  type: ErrorType;
  item: ChoiceItem;
  wrong: string;
  createdAt: string;
  due: string;
  streak: number;
  lastAnswerDay?: string;
  closedAt?: string;
  misses: number;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
};

export function noteKey(lessonId: string, item: ChoiceItem): string {
  return `${lessonId}::${item.prompt}`;
}

export function createNote(lessonId: string, item: ChoiceItem, wrong: string, now = new Date()): ErrorNote {
  return {
    id: noteKey(lessonId, item),
    lessonId,
    type: item.errorType,
    item,
    wrong,
    createdAt: now.toISOString(),
    due: addDays(now, GAPS[0]).toISOString(),
    streak: 0,
    misses: 1,
  };
}

/** Повторная ошибка в уже записанном задании: серия сбрасывается. */
export function missAgain(n: ErrorNote, wrong: string, now = new Date()): ErrorNote {
  return { ...n, wrong, streak: 0, misses: n.misses + 1, closedAt: undefined, due: addDays(now, GAPS[0]).toISOString(), lastAnswerDay: dayKey(now) };
}

export function answerNote(n: ErrorNote, correct: boolean, now = new Date()): ErrorNote {
  if (!correct) return missAgain(n, n.wrong, now);
  // Второй верный ответ в тот же день не засчитывается — нужны разные дни.
  if (n.lastAnswerDay === dayKey(now) && n.streak > 0) return n;
  const streak = n.streak + 1;
  if (streak >= CLOSE_AFTER) return { ...n, streak, lastAnswerDay: dayKey(now), closedAt: now.toISOString() };
  return { ...n, streak, lastAnswerDay: dayKey(now), due: addDays(now, GAPS[streak]).toISOString() };
}

export function isOpen(n: ErrorNote): boolean {
  return !n.closedAt;
}

export function isNoteDue(n: ErrorNote, now = new Date()): boolean {
  return isOpen(n) && new Date(n.due).getTime() <= now.getTime();
}
