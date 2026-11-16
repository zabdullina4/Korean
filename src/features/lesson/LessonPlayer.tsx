import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Rich } from '../../components/Rich';
import { WordTapProvider } from '../../components/WordSheet';
import { GRADES, isPreviewLesson, LESSON_BY_ID } from '../../content/catalog';
import type { ChoiceItem, Step } from '../../content/types';
import { bell } from '../../lib/sound';
import { useSchool } from '../../state/store';
import { BoardStep } from './steps/BoardStep';
import { BuildStep } from './steps/BuildStep';
import { ChoiceStep } from './steps/ChoiceStep';
import { ComposeStep } from './steps/ComposeStep';
import { DialogueStep } from './steps/DialogueStep';
import { DoneStep } from './steps/DoneStep';
import { LettersStep } from './steps/LettersStep';

export interface StepProps<S extends Step = Step> {
  step: S;
  /** Разрешить переход дальше. */
  ready(): void;
  /** Ошибка: учитывается в оценке; задания с выбором ещё и попадают в 오답노트. */
  mistake(item?: ChoiceItem, wrong?: string): void;
}

const STEP_LABEL: Record<Step['kind'], string> = {
  dialogue: 'Ситуация',
  board: 'Объяснение',
  letters: 'Буквы',
  choice: 'Задания',
  build: 'Сборка',
  compose: 'Слоги',
};

export function LessonPlayer() {
  const { id = '' } = useParams();
  const lesson = LESSON_BY_ID[id];
  const nav = useNavigate();
  const school = useSchool();
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState(0);

  if (!lesson) {
    return (
      <div className="app">
        <div className="empty" style={{ marginTop: 40 }}>
          <b>Урок не найден</b>
          <button className="btn-link" onClick={() => nav('/')}>
            Вернуться в кампус
          </button>
        </div>
      </div>
    );
  }

  const total = lesson.steps.length + 1;
  const done = i === lesson.steps.length;
  const step = lesson.steps[i];
  const autoReady = step && (step.kind === 'board' || step.kind === 'dialogue');
  const canGo = done || autoReady || ready;
  const score = Math.max(50, 100 - errors * 7);
  const preview = isPreviewLesson(lesson, school.grade);

  const next = () => {
    if (done) {
      if (!preview) school.completeLesson(lesson, score);
      nav('/', { state: { fresh: !preview } });
      return;
    }
    if (i === lesson.steps.length - 1 && school.bell) bell();
    setI(i + 1);
    setReady(false);
    window.scrollTo(0, 0);
  };

  const props = {
    ready: () => setReady(true),
    mistake: (item?: ChoiceItem, wrong?: string) => {
      setErrors((e) => e + 1);
      if (item && wrong && !preview) school.recordError(lesson.id, item, wrong);
    },
  };

  let body;
  if (done) body = <DoneStep lesson={lesson} score={score} errors={errors} preview={preview} />;
  else
    switch (step.kind) {
      case 'dialogue':
        body = <DialogueStep key={i} step={step} {...props} />;
        break;
      case 'board':
        body = <BoardStep key={i} step={step} {...props} />;
        break;
      case 'letters':
        body = <LettersStep key={i} step={step} {...props} />;
        break;
      case 'choice':
        body = <ChoiceStep key={i} step={step} {...props} />;
        break;
      case 'build':
        body = <BuildStep key={i} step={step} {...props} />;
        break;
      case 'compose':
        body = <ComposeStep key={i} step={step} {...props} />;
        break;
    }

  return (
    <WordTapProvider>
    <div className="app">
      <header className="lhead pad">
        <button className="iconbtn" aria-label="Вернуться в кампус" onClick={() => nav('/')}>
          <svg viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="t">
          <small>
            {GRADES[lesson.grade].name} · юнит {lesson.unit}
            {preview ? ' · превью' : ''}
          </small>
          <b>
            <Rich text={lesson.short} tap={false} />
          </b>
        </div>
        <span className="chip">
          {i + 1} / {total}
        </span>
      </header>
      <div className="dots pad" aria-label={`Этап: ${done ? 'Итог' : STEP_LABEL[step.kind]}`}>
        {Array.from({ length: total }, (_, k) => (
          <i key={k} className={k < i ? 'on' : k === i ? 'cur' : ''} />
        ))}
      </div>
      {body}
      <div className="lfoot pad">
        <button className="cta" disabled={!canGo} onClick={next}>
          {done ? (preview ? 'Вернуться в кампус' : 'В кампус') : i === lesson.steps.length - 1 ? 'Завершить урок' : 'Дальше'}
        </button>
        {!canGo && <p className="hint">Выполните задание, чтобы продолжить</p>}
      </div>
    </div>
    </WordTapProvider>
  );
}
