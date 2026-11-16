import { useState } from 'react';
import { Rich } from '../../../components/Rich';
import type { Step } from '../../../content/types';
import { speak } from '../../../lib/sound';
import { plain } from '../../../components/Rich';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'dialogue' }>;
const COLORS = ['var(--cheong)', 'var(--jeok)', 'var(--hwang)'];

export function DialogueStep({ step }: StepProps<S>) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const people = [...new Set(step.lines.map((l) => l.who))];
  return (
    <>
      <section className="board" aria-label="Доска">
        <h2>{step.title}</h2>
        {step.sub && <p className="sub">{step.sub}</p>}
        <p className="sub" style={{ marginTop: -8 }}>Нажмите на любое корейское слово — откроется его разбор.</p>
        <div className="chat">
          {step.lines.map((l, k) => (
            <div className={`msg${l.me ? ' me' : ''}`} key={k}>
              <div className="ava" style={{ background: COLORS[people.indexOf(l.who) % COLORS.length] }}>
                {l.who[0]}
              </div>
              <div className="bub">
                <span className="who">{l.who}</span>
                <span className="k">
                  <Rich text={l.kr} />
                </span>
                <span className="ru" hidden={!open.has(k)}>
                  {l.ru}
                </span>
                <button
                  className="bub-act"
                  aria-expanded={open.has(k)}
                  onClick={() => {
                    speak(plain(l.kr));
                    setOpen((o) => new Set(o).add(k));
                  }}
                >
                  ▶ {open.has(k) ? 'ещё раз' : 'слушать и перевод'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {step.note && (
        <div className="sheetbox">
          <h4>Заметьте</h4>
          <Rich text={step.note} />
        </div>
      )}
    </>
  );
}
