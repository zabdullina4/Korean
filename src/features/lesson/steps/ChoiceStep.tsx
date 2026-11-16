import { useState } from 'react';
import { Rich } from '../../../components/Rich';
import type { Step } from '../../../content/types';
import { speak } from '../../../lib/sound';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'choice' }>;

export function ChoiceStep({ step, ready, mistake }: StepProps<S>) {
  const [n, setN] = useState(0);
  const [ans, setAns] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const it = step.items[n];
  const last = n === step.items.length - 1;
  const wide = it.options.some((o) => o.length > 10);
  const isText = !it.prompt.includes('___') && !/^[\p{Script=Hangul}\s]+$/u.test(it.prompt);

  const choose = (k: number) => {
    setAns(k);
    if (k === it.answer) setRight((r) => r + 1);
    else mistake(it, it.options[k]);
    if (last) ready();
  };

  const prompt = it.prompt === '___' ? null : it.prompt.replace('___', '\u0000');
  return (
    <>
      <section className="board" style={{ paddingBottom: 14 }}>
        <h2>{step.title}</h2>
        {step.sub ? (
          <p className="sub" style={{ margin: 0 }}>
            <Rich text={step.sub} />
          </p>
        ) : null}
      </section>
      <div className="sheetbox">
        <div className="count">
          Задание {n + 1} из {step.items.length} · верно {right}
        </div>
        {it.audio && (
          <button className="play" onClick={() => speak(it.audio!)} aria-label="Прослушать">
            ▶ Слушать
          </button>
        )}
        {prompt !== null && (
          <p className={`q${isText ? ' text' : ''}`}>
            {prompt.split('\u0000').map((part, k, arr) => (
              <span key={k}>
                <Rich text={part} tap={ans !== null} />
                {k < arr.length - 1 && <span className="gap">{ans !== null ? it.options[it.answer] : ' '}</span>}
              </span>
            ))}
            {it.ru && <span className="ru">{it.ru}</span>}
          </p>
        )}
        {prompt === null && it.ru && <p className="q text">{it.ru}</p>}
        <div className="opts">
          {it.options.map((o, k) => (
            <button
              key={o}
              className={`opt${wide ? ' wide' : ''}${ans !== null && k === it.answer ? ' right' : ''}${ans === k && k !== it.answer ? ' wrong' : ''}`}
              disabled={ans !== null}
              onClick={() => choose(k)}
            >
              {o}
            </button>
          ))}
        </div>
        {ans !== null && (
          <div className={`fb${ans === it.answer ? '' : ' bad'}`} role="status">
            <span className="pen">{ans === it.answer ? '잘했어요!' : `→ ${it.options[it.answer]}`}</span>
            <Rich text={it.why} />
            {ans !== it.answer && (
              <>
                <br />
                <small style={{ color: 'var(--ink-3)' }}>Записано в 오답노트 · вернётся завтра</small>
              </>
            )}
          </div>
        )}
        {ans !== null && !last && (
          <button
            className="cta"
            style={{ marginTop: 12, background: 'var(--board-2)' }}
            onClick={() => {
              setN(n + 1);
              setAns(null);
            }}
          >
            Следующее задание
          </button>
        )}
      </div>
    </>
  );
}
