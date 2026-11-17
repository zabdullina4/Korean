// Генератор учебного дня (시간표): из состояния ученика собирает расписание.
import { EXAMS, gradeLessons } from '../content/catalog';
import type { Lesson, SkillKey } from '../content/types';
import type { SchoolState } from '../state/store';
import { dayKey, LAST_GRADE, NEW_CARDS_PER_DAY } from '../state/store';
import { isNoteDue, isOpen } from './notebook';
import { isDue, isMature, State } from './srs';

export type SlotStatus = 'done' | 'next' | 'todo' | 'soon';
export type SlotAction = { type: 'review' } | { type: 'lesson'; lessonId: string } | { type: 'exam'; examId: string } | { type: 'notebook' } | { type: 'none' };

export interface Slot {
  id: string;
  per: string;
  time: string;
  title: string;
  detail: string;
  skill: SkillKey;
  minutes: number;
  status: SlotStatus;
  action: SlotAction;
}

type Snapshot = Pick<SchoolState, 'grade' | 'lessons' | 'cards' | 'notes' | 'reviewsByDay' | 'newByDay'> & Partial<Pick<SchoolState, 'exams'>>;

export function reviewQueue(s: Snapshot, now = new Date()) {
  const cards = Object.values(s.cards);
  const due = cards.filter((c) => isDue(c.fsrs, now)).sort((a, b) => a.fsrs.due.localeCompare(b.fsrs.due));
  const newLeft = Math.max(0, NEW_CARDS_PER_DAY - (s.newByDay[dayKey(now)] ?? 0));
  const fresh = cards.filter((c) => c.fsrs.state === State.New).slice(0, newLeft);
  return { due, fresh, all: [...due, ...fresh] };
}

const doneToday = (s: Snapshot, l: Lesson, now: Date) => {
  const r = s.lessons[l.id];
  return !!r && dayKey(new Date(r.completedAt)) === dayKey(now);
};

export function buildDay(s: Snapshot, now = new Date()): Slot[] {
  const slots: Slot[] = [];
  const q = reviewQueue(s, now);
  const reviewedToday = s.reviewsByDay[dayKey(now)] ?? 0;

  slots.push({
    id: 'jo',
    per: '조회',
    time: '08:40',
    title: 'Повторение слов',
    detail: q.all.length ? `${q.due.length} к повторению · ${q.fresh.length} новых` : reviewedToday ? `Сделано: ${reviewedToday} карточек` : 'Пока нет карточек',
    skill: 'core',
    minutes: Math.max(1, Math.ceil(q.all.length * 0.25)),
    status: q.all.length ? 'todo' : 'done',
    action: q.all.length ? { type: 'review' } : { type: 'none' },
  });

  const lessons = gradeLessons(s.grade);
  const today = lessons.filter((l) => doneToday(s, l, now));
  const pending = lessons.filter((l) => !s.lessons[l.id]);
  const picks: { l: Lesson; done: boolean }[] = [...today.map((l) => ({ l, done: true })), ...pending.map((l) => ({ l, done: false }))].slice(0, 2);

  // Когда все уроки класса пройдены, в расписании появляется переводной экзамен.
  const examDef = EXAMS[s.grade];
  const passed = examDef && (s.exams?.[examDef.id] ?? []).some((a) => a.passed);
  const exam = examDef && !passed && pending.length === 0 ? examDef : null;
  let examTaken = false;

  ['1교시', '2교시'].forEach((per, i) => {
    const p = picks[i];
    if (p)
      slots.push({
        id: `les${i}`,
        per,
        time: i ? '09:50' : '09:00',
        title: p.l.short,
        detail: p.l.title,
        skill: p.l.skill,
        minutes: p.l.minutes,
        status: p.done ? 'done' : 'todo',
        action: { type: 'lesson', lessonId: p.l.id },
      });
    else if (exam && !examTaken) {
      examTaken = true;
      slots.push({
        id: `les${i}`,
        per,
        time: i ? '09:50' : '09:00',
        title: exam.titleKr,
        detail: `${s.grade >= LAST_GRADE ? 'Выпускной' : 'Переводной'} экзамен · ${exam.minutes} мин · зачёт от ${Math.round(exam.pass * 100)}%`,
        skill: 'read',
        minutes: exam.minutes,
        status: 'todo',
        action: { type: 'exam', examId: exam.id },
      });
    } else
      slots.push({
        id: `les${i}`,
        per,
        time: i ? '09:50' : '09:00',
        // Класс без экзамена (4급 пока наполняется) — ещё не «пройден».
        title: pending.length === 0 && lessons.length && examDef ? (s.grade >= LAST_GRADE && passed ? 'Школа окончена' : 'Класс пройден') : 'Новые уроки готовятся',
        detail: s.grade >= LAST_GRADE && passed ? 'Повторяйте карточки и уроки любого класса' : 'Скоро в приложении',
        skill: 'read',
        minutes: 15,
        status: 'soon',
        action: { type: 'none' },
      });
  });

  slots.push({
    id: 'break',
    per: '쉬는 시간',
    time: '',
    title: 'Блиц: минимальные пары',
    detail: '운동장 · скоро',
    skill: 'listen',
    minutes: 3,
    status: 'soon',
    action: { type: 'none' },
  });

  const notes = Object.values(s.notes);
  const dueNotes = notes.filter((n) => isNoteDue(n, now));
  const open = notes.filter(isOpen);
  slots.push({
    id: 'jong',
    per: '종례',
    time: '12:30',
    title: 'Тетрадь ошибок',
    detail: dueNotes.length ? `${dueNotes.length} записей на сегодня` : open.length ? `${open.length} открытых, вернутся позже` : 'Ошибок нет',
    skill: 'write',
    minutes: Math.max(1, Math.ceil(dueNotes.length * 0.5)),
    status: dueNotes.length ? 'todo' : 'done',
    action: dueNotes.length ? { type: 'notebook' } : { type: 'none' },
  });

  const first = slots.find((x) => x.status === 'todo');
  if (first) first.status = 'next';
  return slots;
}

export function stats(s: Snapshot) {
  const cards = Object.values(s.cards);
  const words = new Set(cards.map((c) => c.wordId));
  const known = new Set(cards.filter((c) => c.fsrs.state === State.Review).map((c) => c.wordId));
  const lessons = gradeLessons(s.grade);
  const notes = Object.values(s.notes);
  return {
    words: words.size,
    known: known.size,
    mature: new Set(cards.filter((c) => isMature(c.fsrs)).map((c) => c.wordId)).size,
    lessonsDone: lessons.filter((l) => s.lessons[l.id]).length,
    lessonsTotal: lessons.length,
    notesOpen: notes.filter(isOpen).length,
    notesClosed: notes.filter((n) => !isOpen(n)).length,
  };
}
