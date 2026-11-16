import { useState } from 'react';
import { Rich } from '../../../components/Rich';
import type { Step } from '../../../content/types';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'build' }>;

/** Сборка из блоков. Частицы и окончания подсвечиваются по известным хвостам. */
const TAILS: [string, 'p' | 'e'][] = [
  ['니까', 'e'], ['해서', 'e'], ['ㅂ시다', 'e'], ['릅시다', 'e'], ['이', 'p'], ['을', 'p'], ['를', 'p'], ['가', 'p'], ['은', 'p'], ['는', 'p'],
];
function Tile({ w }: { w: string }) {
  if (w.length > 1)
    for (const [t, c] of TAILS)
      if (w.endsWith(t) && w.length > t.length) {
        const cut = t === '해서' ? w.length - 1 : w.length - t.length;
        return (
          <>
            {w.slice(0, cut)}
            <span className={c}>{w.slice(cut)}</span>
          </>
        );
      }
  return <>{w}</>;
}

export function BuildStep({ step, ready, mistake }: StepProps<S>) {
  const [ans, setAns] = useState<string[]>([]);
  const [ok, setOk] = useState(false);
  const [fb, setFb] = useState<string | null>(null);
  const pool = step.pool.filter((w, k) => step.pool.indexOf(w) === k && !ans.includes(w));

  const check = () => {
    if (ans.join(' ') === step.target.join(' ')) {
      setOk(true);
      setFb(null);
      ready();
      return;
    }
    mistake();
    const hint = step.hints.find((h) => ans.includes(h.ifIncludes));
    setFb(hint ? hint.why : ans.length < step.target.length ? 'Не хватает блоков.' : 'Проверьте порядок: сказуемое всегда в конце.');
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
      <div className="sheetbox">
        <p className="q text">{step.ru}</p>
        <div className="target" aria-label="Ваш ответ">
          {ans.map((w) => (
            <button key={w} className="tile" disabled={ok} onClick={() => (setAns(ans.filter((x) => x !== w)), setFb(null))}>
              <Tile w={w} />
            </button>
          ))}
        </div>
        <div className="pool">
          {pool.map((w) => (
            <button key={w} className="tile" disabled={ok} onClick={() => (setAns([...ans, w]), setFb(null))}>
              <Tile w={w} />
            </button>
          ))}
        </div>
        {!ok && (
          <button className="cta" style={{ marginTop: 14, background: 'var(--board-2)' }} disabled={!ans.length} onClick={check}>
            Проверить
          </button>
        )}
        {ok && (
          <div className="fb" role="status">
            <span className="pen">참 잘했어요!</span>
            <span className="kr">{step.target.join(step.target.every((t) => t.length === 1) ? '' : ' ')}</span>
          </div>
        )}
        {fb && (
          <div className="fb bad" role="status">
            <span className="pen">거의 다 왔어요</span>
            <Rich text={fb} />
          </div>
        )}
      </div>
    </>
  );
}
