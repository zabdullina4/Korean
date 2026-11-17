// Аттестат выпускника (졸업장): история обучения по классам и итог по навыкам.
// Чистая логика — экран выпускного только рисует то, что здесь посчитано.
import { EXAMS, GRADES, gradeLessons } from '../content/catalog';
import type { ExamDef, SectionKey } from '../content/exam';
import type { ExamAttempt } from './exam';

export interface DiplomaSnapshot {
  lessons: Record<string, unknown>;
  exams: Record<string, ExamAttempt[]>;
  graduated: string | null;
}

export interface DiplomaRow {
  grade: number;
  name: string;
  lessonsDone: number;
  lessonsTotal: number;
  /** Лучший сданный результат в шкале экзамена (TOPIK I — 200, TOPIK II — 300, иначе %). */
  score: number | null;
  scale: number;
  passedAt: string | null;
}

/** Балл попытки в шкале экзамена. */
export function scaled(exam: ExamDef, a: ExamAttempt): number {
  return exam.scale ? Math.round((a.correct / a.total) * exam.scale) : Math.round((a.correct / a.total) * 100);
}

function bestPassed(exam: ExamDef, attempts: ExamAttempt[] = []): ExamAttempt | null {
  const passed = attempts.filter((a) => a.passed);
  if (!passed.length) return null;
  return passed.reduce((b, a) => (scaled(exam, a) > scaled(exam, b) ? a : b));
}

export function diplomaRows(s: DiplomaSnapshot): DiplomaRow[] {
  return GRADES.map((g) => {
    const lessons = gradeLessons(g.n);
    const exam = EXAMS[g.n];
    const best = exam ? bestPassed(exam, s.exams[exam.id]) : null;
    return {
      grade: g.n,
      name: g.n === 0 ? '예비반' : g.name,
      lessonsDone: lessons.filter((l) => s.lessons[l.id]).length,
      lessonsTotal: lessons.length,
      score: exam && best ? scaled(exam, best) : null,
      scale: exam?.scale ?? 100,
      passedAt: best?.at ?? null,
    };
  });
}

/**
 * Навыки выпускника: средняя доля верного по разделу во всех сданных экзаменах (лучшие попытки),
 * в процентах. Письмо есть только в TOPIK II (3–6급), аудирование и чтение — везде.
 */
export function skillProfile(s: DiplomaSnapshot): Record<SectionKey, number | null> {
  const sum: Record<SectionKey, [number, number]> = { listen: [0, 0], read: [0, 0], write: [0, 0] };
  for (const exam of Object.values(EXAMS)) {
    const best = bestPassed(exam, s.exams[exam.id]);
    if (!best) continue;
    for (const sec of best.sections) {
      if (!sec.total) continue;
      sum[sec.key][0] += sec.right / sec.total;
      sum[sec.key][1] += 1;
    }
  }
  const pct = ([v, n]: [number, number]) => (n ? Math.round((v / n) * 100) : null);
  return { listen: pct(sum.listen), read: pct(sum.read), write: pct(sum.write) };
}

/** Уровень настоящего TOPIK II по баллу из 300. */
export function topik2Level(score: number): number {
  return score >= 230 ? 6 : score >= 190 ? 5 : score >= 150 ? 4 : score >= 120 ? 3 : 0;
}

/** Номер аттестата: стабилен для ученика, зависит от даты выпуска. */
export function diplomaNo(graduated: string): string {
  const d = graduated.slice(0, 10).replace(/-/g, '');
  return `제 ${d.slice(2)}-06 호`;
}
