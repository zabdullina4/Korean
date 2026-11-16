import { useState } from 'react';
import { Rich } from '../../../components/Rich';
import { WongojiGrid } from '../../../components/WongojiGrid';
import type { Step } from '../../../content/types';
import { topikLength } from '../../../lib/wongoji';
import { lengthIssue, styleIssues } from '../../../lib/writing';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'write' }>;

/** Свободное письмо: счётчик знаков, проверка стиля, просмотр на бланке и образец. Оценивает себя сам ученик. */
export function WriteStep({ step, ready }: StepProps<S>) {
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(false);
  const [model, setModel] = useState(false);
  const n = topikLength(text);
  const issues = [...styleIssues(text), ...(checked ? [lengthIssue(text, step.min, step.max)].filter((x) => x !== null) : [])];

  return (
    <>
      <section className="board" style={{ paddingBottom: 14 }}>
        <h2>{step.title}</h2>
        {step.sub && (
          <p className="sub" style={{ margin: 0 }}>
            {step.sub}
          </p>
        )}
      </section>
      <div className="sheetbox" style={{ backgroundImage: 'none' }}>
        <div className="w-task kr">
          <Rich text={step.task} />
        </div>
        <label htmlFor="w-text" className="w-label">
          Ваш ответ <span className={n < step.min || n > step.max ? 'w-n bad' : 'w-n'}>{n} / {step.min}–{step.max} знаков</span>
        </label>
        <textarea id="w-text" lang="ko" className="w-area kr" value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Пишите в стиле 한다체…" />
        {issues.length > 0 && (
          <ul className="w-issues">
            {issues.map((i, k) => (
              <li key={k}>
                <b className="kr">{i.text}</b> — {i.hint}
              </li>
            ))}
          </ul>
        )}
        <div className="w-actions">
          <button
            className="cta"
            style={{ background: 'var(--board-2)' }}
            disabled={!text.trim()}
            onClick={() => {
              setChecked(true);
              setModel(true);
              ready();
            }}
          >
            Проверить и сравнить с образцом
          </button>
          {!model && (
            <button
              className="btn-link"
              onClick={() => {
                setModel(true);
                ready();
              }}
            >
              Пропустить и показать образец
            </button>
          )}
        </div>
        {checked && text.trim() && (
          <>
            <h4 style={{ marginTop: 16 }}>Ваш текст на бланке</h4>
            <WongojiGrid text={text} />
          </>
        )}
        {model && (
          <>
            <h4 style={{ marginTop: 16 }}>Образец ответа</h4>
            <WongojiGrid text={step.model} />
            <h4 style={{ marginTop: 14 }}>Проверьте себя</h4>
            <ul className="w-check">
              {step.checklist.map((c, k) => (
                <li key={k}>
                  <Rich text={c} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
