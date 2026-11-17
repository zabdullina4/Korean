// Новые слова урока показываются до того, как их проверяют.
// withVocab() вставляет шаг «Новые слова» после первого объяснения урока (и всегда до первого задания на эти слова),
// если автор урока не поставил такой шаг сам.
import type { Lesson, Step, Word } from './types';

function mentions(step: Step, w: Word): boolean {
  switch (step.kind) {
    case 'choice':
      return step.items.some((it) => it.prompt.includes(w.kr) || it.options.some((o) => o.includes(w.kr) || o === w.ru));
    case 'build':
      return step.target.some((t) => t.includes(w.kr));
    default:
      return false;
  }
}

export function vocabStep(words: Word[]): Step {
  return {
    kind: 'words',
    title: words.length === 1 ? 'Новое слово' : 'Новые слова',
    sub: 'Нажмите на каждую карточку: откроются перевод и произношение.',
    words,
  };
}

export function withVocab(lesson: Lesson): Lesson {
  if (!lesson.words.length || lesson.steps.some((s) => s.kind === 'words')) return lesson;
  // Слова учим в начале урока — сразу после первого объяснения (доска, диалог, буквы),
  // но в любом случае до первого задания, где они встречаются.
  const at = lesson.steps.findIndex((s) => lesson.words.some((w) => mentions(s, w)));
  // В уроках хангыля слова нельзя показывать раньше букв: ученик их ещё не прочитает.
  const letters = lesson.steps.findIndex((s) => s.kind === 'letters');
  const firstExplain = lesson.steps.findIndex((s) => s.kind === 'board' || s.kind === 'dialogue' || s.kind === 'letters');
  const early = letters >= 0 ? letters + 1 : firstExplain >= 0 ? firstExplain + 1 : 0;
  const idx = at >= 0 ? Math.min(at, early) : early;
  const steps = [...lesson.steps];
  steps.splice(idx, 0, vocabStep(lesson.words));
  return { ...lesson, steps };
}

/** Для проверки контента: слова урока, которые проверяются раньше, чем показаны. */
export function testedBeforeTaught(lesson: Lesson): string[] {
  const taught = new Set<string>();
  const bad = new Set<string>();
  for (const s of lesson.steps) {
    if (s.kind === 'words') s.words.forEach((w) => taught.add(w.kr));
    for (const w of lesson.words) if (mentions(s, w) && !taught.has(w.kr)) bad.add(w.kr);
  }
  return [...bad];
}
