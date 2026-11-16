import { useState } from 'react';
import { Rich } from '../../../components/Rich';
import { toast } from '../../../components/toast';
import type { Step } from '../../../content/types';
import { hasKoreanVoice, speak } from '../../../lib/sound';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'letters' }>;
let warned = false;

/** Карточки букв: шаг засчитан, когда ученик открыл каждую. */
export function LettersStep({ step, ready }: StepProps<S>) {
  const [heard, setHeard] = useState<Set<number>>(new Set());
  const [cur, setCur] = useState<number | null>(null);
  const tap = (k: number) => {
    const l = step.letters[k];
    const ok = speak(l.say);
    if ((!ok || !hasKoreanVoice()) && !warned) {
      warned = true;
      toast('В этом браузере нет корейского голоса — ориентируйтесь на подсказку');
    }
    const h = new Set(heard).add(k);
    setHeard(h);
    setCur(k);
    if (h.size === step.letters.length) ready();
  };
  const c = cur === null ? null : step.letters[cur];
  return (
    <>
      <section className="board" aria-label="Доска">
        <h2>{step.title}</h2>
        {step.sub && <p className="sub">{step.sub}</p>}
        <div className="letters">
          {step.letters.map((l, k) => (
            <button key={l.char} className={`letter${heard.has(k) ? ' heard' : ''}`} onClick={() => tap(k)} aria-label={`${l.char}: ${l.hint}`}>
              <span className="ch">{l.char}</span>
              <span className="nm">{l.name ?? l.say}</span>
            </button>
          ))}
        </div>
        <p className="letter-hint" aria-live="polite">
          {c ? (
            <>
              <b>{c.say}</b>
              {c.hint}
            </>
          ) : (
            `Откройте все буквы: ${heard.size} из ${step.letters.length}`
          )}
        </p>
      </section>
      {step.note && (
        <div className="sheetbox">
          <h4>Учитель подсказывает</h4>
          <Rich text={step.note} />
        </div>
      )}
    </>
  );
}
