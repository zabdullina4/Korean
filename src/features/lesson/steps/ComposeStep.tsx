import { useState } from 'react';
import type { Step } from '../../../content/types';
import { compose } from '../../../lib/hangul';
import { speak } from '../../../lib/sound';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'compose' }>;

/** Конструктор слога: выбрать начальную, гласную и (если есть) патчим. Пробовать можно без штрафа. */
export function ComposeStep({ step, ready }: StepProps<S>) {
  const [n, setN] = useState(0);
  const [cho, setCho] = useState(step.palette.cho.length === 1 ? step.palette.cho[0] : '');
  const [jung, setJung] = useState('');
  const [jong, setJong] = useState('');
  const [solved, setSolved] = useState(false);
  const task = step.tasks[n];
  const built = cho && jung ? compose(cho, jung, jong) : null;
  const last = n === step.tasks.length - 1;

  const pick = (part: 'cho' | 'jung' | 'jong', v: string) => {
    if (solved) return;
    const next = { cho, jung, jong, [part]: part === 'jong' && jong === v ? '' : v };
    if (part === 'cho') setCho(v);
    if (part === 'jung') setJung(v);
    if (part === 'jong') setJong(next.jong);
    const syl = next.cho && next.jung ? compose(next.cho, next.jung, next.jong) : null;
    if (syl === task.target) {
      setSolved(true);
      speak(syl);
      if (last) ready();
    }
  };

  const row = (label: string, part: 'cho' | 'jung' | 'jong', items: string[], value: string) => (
    <div className="pal-row" role="group" aria-label={label}>
      <span>{label}</span>
      {items.map((j) => (
        <button key={j} className="jamo" aria-pressed={value === j} onClick={() => pick(part, j)}>
          {j}
        </button>
      ))}
    </div>
  );

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
        <div className="count">
          Слог {n + 1} из {step.tasks.length}
        </div>
        <p className="task-ru">
          Соберите <b className="task-target">{task.target}</b>
          {task.ru ? ` — ${task.ru}` : ''}
        </p>
        <div className={`block${solved ? ' ok' : ''}`} aria-live="polite">
          {built ?? (cho || jung || '?')}
          <span className="parts">{[cho, jung, jong].filter(Boolean).join(' + ')}</span>
        </div>
        <div className="pal">
          {row('Начальная', 'cho', step.palette.cho, cho)}
          {row('Гласная', 'jung', step.palette.jung, jung)}
          {step.palette.jong && row('Патчим', 'jong', step.palette.jong, jong)}
        </div>
        {solved && !last && (
          <button
            className="cta"
            style={{ marginTop: 14, background: 'var(--board-2)' }}
            onClick={() => {
              setN(n + 1);
              setSolved(false);
              setCho(step.palette.cho.length === 1 ? step.palette.cho[0] : '');
              setJung('');
              setJong('');
            }}
          >
            Следующий слог
          </button>
        )}
        {solved && last && (
          <div className="fb" role="status">
            <span className="pen">잘했어요!</span>Все слоги собраны.
          </div>
        )}
      </div>
    </>
  );
}
