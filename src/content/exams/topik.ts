// Общий конструктор экзаменов в формате TOPIK I: банки «сырых» заданий → вариант экзамена по seed.
// В каждом сыром задании правильный ответ — первый вариант; при сборке варианты перемешиваются.
import { rng, sample } from '../../lib/random';
import { shuffleOptions, type ExamDef, type ExamQuestion, type ExamSection } from '../exam';
import type { ChoiceItem, ErrorType } from '../types';

export type Raw = [audioOrText: string, options: string[], why: string];

export interface BankSpec {
  bank: Raw[];
  /** Сколько заданий брать из банка в один вариант. */
  n: number;
  /** Инструкция на корейском (для аудирования — вопрос под кнопкой ▶). */
  prompt: string;
  ru: string;
  errorType: ErrorType;
}

const mk = (spec: BankSpec, listen: boolean, [body, options, why]: Raw): ChoiceItem =>
  listen
    ? { prompt: spec.prompt, ru: spec.ru, audio: body, options, answer: 0, why, errorType: spec.errorType }
    : { prompt: body, ru: spec.ru, options, answer: 0, why, errorType: spec.errorType };

function section(specs: BankSpec[], listen: boolean, r: () => number): ExamQuestion[] {
  return specs.flatMap((spec) => sample(spec.bank, spec.n, r).map((raw) => ({ kind: 'choice' as const, item: shuffleOptions(mk(spec, listen, raw), r) })));
}

export function topikExam(def: { id: string; grade: number; title: string; titleKr: string; minutes: number; pass: number; listen: BankSpec[]; read: BankSpec[] }): ExamDef {
  return {
    id: def.id,
    grade: def.grade,
    title: def.title,
    titleKr: def.titleKr,
    minutes: def.minutes,
    pass: def.pass,
    plays: 2,
    scale: 200,
    make(seed: number): ExamSection[] {
      const r = rng(seed);
      return [
        { key: 'listen', kr: '듣기', ru: 'Аудирование', questions: section(def.listen, true, r) },
        { key: 'read', kr: '읽기', ru: 'Чтение', questions: section(def.read, false, r) },
      ];
    },
  };
}

/** Сколько разных вариантов даёт банк: для проверки, что пересдачи не повторяются. */
export function bankSize(def: { listen: BankSpec[]; read: BankSpec[] }): number {
  return [...def.listen, ...def.read].reduce((a, s) => a + s.bank.length, 0);
}
