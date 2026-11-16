// Обёртка над FSRS (ts-fsrs): хранение карточек в JSON и планирование повторений.
import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';

export { Rating, State };
export type { Grade };

/** Карточка FSRS в виде, пригодном для JSON (даты — ISO-строки). */
export interface StoredFsrs {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: string;
}

export const DESIRED_RETENTION = 0.9;

const scheduler = fsrs(generatorParameters({ request_retention: DESIRED_RETENTION, enable_fuzz: true }));

export function toStored(c: Card): StoredFsrs {
  return {
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review?.toISOString(),
  };
}

export function fromStored(s: StoredFsrs): Card {
  return {
    ...s,
    due: new Date(s.due),
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  } as Card;
}

export function newFsrs(now = new Date()): StoredFsrs {
  return toStored(createEmptyCard(now));
}

export function review(s: StoredFsrs, grade: Grade, now = new Date()): StoredFsrs {
  return toStored(scheduler.next(fromStored(s), now, grade).card);
}

/** Через сколько откроется карточка при каждой оценке — для подписей на кнопках. */
export function preview(s: StoredFsrs, now = new Date()): Record<Grade, Date> {
  const rec = scheduler.repeat(fromStored(s), now);
  return {
    [Rating.Again]: rec[Rating.Again].card.due,
    [Rating.Hard]: rec[Rating.Hard].card.due,
    [Rating.Good]: rec[Rating.Good].card.due,
    [Rating.Easy]: rec[Rating.Easy].card.due,
  } as Record<Grade, Date>;
}

export function isDue(s: StoredFsrs, now = new Date()): boolean {
  return s.state !== State.New && new Date(s.due).getTime() <= now.getTime();
}

/** «Зрелая» карточка — интервал от 21 дня, как в Anki. */
export function isMature(s: StoredFsrs): boolean {
  return s.state === State.Review && s.stability >= 21;
}

export function formatInterval(due: Date, now = new Date()): string {
  const min = Math.max(1, Math.round((due.getTime() - now.getTime()) / 60000));
  if (min < 60) return `${min} мин`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч`;
  const d = Math.round(h / 24);
  if (d < 31) return `${d} дн`;
  const m = Math.round(d / 30);
  if (m < 12) return `${m} мес`;
  return `${(d / 365).toFixed(1)} г`;
}
