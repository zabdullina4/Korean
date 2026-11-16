import { useState } from 'react';
import type { Step } from '../../../content/types';
import { speak } from '../../../lib/sound';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'words' }>;

/** Карточки новых слов: корейское слово → нажатие открывает перевод и озвучивает. */
export function WordsStep({ step, ready }: StepProps<S>) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const flip = (k: number) => {
    speak(step.words[k].kr);
    const n = new Set(open).add(k);
    setOpen(n);
    if (n.size === step.words.length) ready();
  };
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
          Открыто {open.size} из {step.words.length}
        </div>
        <div className="vocab">
          {step.words.map((w, k) => (
            <button key={w.id} className={`vcard${open.has(k) ? ' open' : ''}`} onClick={() => flip(k)} aria-expanded={open.has(k)}>
              <span className="kr vk">{w.kr}</span>
              {open.has(k) ? (
                <>
                  {w.pron && <span className="vp kr">{w.pron}</span>}
                  <span className="vr">{w.ru}</span>
                  {w.note && <span className="vn">{w.note}</span>}
                </>
              ) : (
                <span className="vh">нажмите</span>
              )}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '12px 0 0' }}>После урока эти слова появятся в 단어장 — карточки будут возвращаться по расписанию FSRS.</p>
      </div>
    </>
  );
}
