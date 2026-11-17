import { useEffect, useMemo, useState } from 'react';
import { Rich } from '../../../components/Rich';
import type { HanjaRoot, Step } from '../../../content/types';
import { speak } from '../../../lib/sound';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'hanja' }>;

/** Граф корня: иероглиф в центре, слова по кругу. Нажатие на слово раскладывает его по иероглифам. */
export function HanjaStep({ step, ready }: StepProps<S>) {
  const [cur, setCur] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const [word, setWord] = useState<number | null>(null);
  const root = step.roots[cur];
  // Все известные в шаге иероглифы — чтобы разложить слово целиком.
  const known = useMemo(() => {
    const m = new Map<string, HanjaRoot>();
    for (const r of step.roots) m.set(r.char, r);
    return m;
  }, [step.roots]);

  const pick = (k: number) => {
    setCur(k);
    setWord(null);
    const n = new Set(seen).add(k);
    setSeen(n);
    if (n.size === step.roots.length) ready();
  };
  // Один корень — шаг засчитан сразу.
  useEffect(() => {
    if (step.roots.length === 1) ready();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const w = word === null ? null : root.words[word];
  const n = root.words.length;
  return (
    <>
      <section className="board">
        <h2>{step.title}</h2>
        {step.sub && <p className="sub">{step.sub}</p>}
        {step.roots.length > 1 && (
          <div className="hj-tabs" role="tablist">
            {step.roots.map((r, k) => (
              <button key={r.char} role="tab" aria-selected={k === cur} className={`hj-tab${seen.has(k) ? ' seen' : ''}`} onClick={() => pick(k)}>
                <span className="hj-c">{r.char}</span>
                <span className="kr">{r.sound}</span>
              </button>
            ))}
          </div>
        )}
        <div className="hj-graph" aria-label={`Корень ${root.char} (${root.sound}) — ${root.meaning}`}>
          <svg viewBox="0 0 100 100" className="hj-lines" aria-hidden="true">
            {root.words.map((_, k) => {
              const a = (k / n) * Math.PI * 2 - Math.PI / 2;
              return <line key={k} x1="50" y1="50" x2={50 + Math.cos(a) * 38} y2={50 + Math.sin(a) * 38} className={k === word ? 'on' : ''} />;
            })}
          </svg>
          <button className="hj-center" onClick={() => speak(root.sound)}>
            <span className="hj-c">{root.char}</span>
            <span className="kr">{root.sound}</span>
            <span className="hj-m">{root.meaning}</span>
          </button>
          {root.words.map((x, k) => {
            const a = (k / n) * Math.PI * 2 - Math.PI / 2;
            return (
              <button
                key={x.kr}
                className={`hj-word${k === word ? ' on' : ''}`}
                style={{ left: `${50 + Math.cos(a) * 38}%`, top: `${50 + Math.sin(a) * 38}%` }}
                onClick={() => {
                  setWord(k);
                  speak(x.kr);
                }}
              >
                <span className="kr">{x.kr}</span>
                <small>{x.hanja}</small>
              </button>
            );
          })}
        </div>
        <p className="letter-hint" aria-live="polite">
          {w ? (
            <>
              <b>{w.kr}</b> {w.ru} ={' '}
              {[...w.hanja].map((h, k) => {
                const r = known.get(h);
                return (
                  <span key={k} className="hj-part">
                    {h}
                    {r ? ` ${r.sound} «${r.meaning}»` : ''}
                    {k < w.hanja.length - 1 ? ' + ' : ''}
                  </span>
                );
              })}
            </>
          ) : (
            'Нажмите на слово — увидите, из каких корней оно состоит.'
          )}
        </p>
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
