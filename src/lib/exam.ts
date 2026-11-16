// Проверка экзамена и правила пересдачи.
import { spellToChoice, type ExamDef, type ExamQuestion, type ExamSection, type SectionKey } from '../content/exam';
import type { ChoiceItem } from '../content/types';
import { noteKey, type ErrorNote } from './notebook';
import { hash, rng } from './random';

export type Answer = number | string[] | null;

export interface ExamAttempt {
  at: string;
  seed: number;
  correct: number;
  total: number;
  passed: boolean;
  sections: { key: SectionKey; right: number; total: number }[];
  wrongNoteIds: string[];
}

export interface Graded {
  attempt: ExamAttempt;
  /** Ошибки в виде заданий с выбором — для 오답노트. */
  mistakes: { item: ChoiceItem; wrong: string }[];
}

export function seedFor(examId: string, attemptNo: number): number {
  return hash(`${examId}#${attemptNo}`);
}

export function isRight(q: ExamQuestion, a: Answer): boolean {
  if (a === null) return false;
  if (q.kind === 'choice') return a === q.item.answer;
  return Array.isArray(a) && a.join('') === q.item.target.join('');
}

export function grade(exam: ExamDef, seed: number, sections: ExamSection[], answers: Answer[][], now = new Date()): Graded {
  const r = rng(seed ^ 0x5eed);
  const mistakes: Graded['mistakes'] = [];
  let correct = 0;
  let total = 0;
  const per = sections.map((sec, si) => {
    let right = 0;
    sec.questions.forEach((q, qi) => {
      const a = answers[si]?.[qi] ?? null;
      if (isRight(q, a)) right++;
      else if (q.kind === 'choice') mistakes.push({ item: q.item, wrong: a === null ? '— нет ответа —' : q.item.options[a as number] });
      else mistakes.push({ item: spellToChoice(q.item, r), wrong: Array.isArray(a) && a.length ? a.join('') : '— нет ответа —' });
    });
    correct += right;
    total += sec.questions.length;
    return { key: sec.key, right, total: sec.questions.length };
  });
  const attempt: ExamAttempt = {
    at: now.toISOString(),
    seed,
    correct,
    total,
    passed: total > 0 && correct / total >= exam.pass,
    sections: per,
    wrongNoteIds: mistakes.map((m) => noteKey(exam.id, m.item)),
  };
  return { attempt, mistakes };
}

/** После провала пересдача открывается, когда каждая ошибка экзамена отработана в 보충수업. */
export function retakeStatus(last: ExamAttempt | undefined, notes: Record<string, ErrorNote>): { ok: boolean; left: number } {
  if (!last || last.passed) return { ok: true, left: 0 };
  const left = last.wrongNoteIds.filter((id) => {
    const n = notes[id];
    return n && !n.closedAt && !(n.lastAnsweredAt && n.lastAnsweredAt > last.at);
  }).length;
  return { ok: left === 0, left };
}
