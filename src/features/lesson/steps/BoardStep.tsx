import { Rich } from '../../../components/Rich';
import type { Step } from '../../../content/types';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'board' }>;

export function BoardStep({ step }: StepProps<S>) {
  return (
    <>
      <section className="board" aria-label="Доска">
        <h2>{step.title}</h2>
        {step.sub && <p className="sub">{step.sub}</p>}
        <div className="chalk">
          {step.lines.map((l, k) => (
            <span className="cl" key={k} style={{ ['--i' as string]: k }}>
              <Rich text={l} />
            </span>
          ))}
        </div>
        {step.note && (
          <p className="note">
            <Rich text={step.note} />
          </p>
        )}
      </section>
      {step.table && (
        <div className="sheetbox" style={{ background: 'var(--board)', backgroundImage: 'none', border: 0, overflowX: 'auto' }}>
          <table className="rtable">
            <thead>
              <tr>
                {step.table.head.map((h) => (
                  <th key={h} className="kr">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {step.table.rows.map((r, k) => (
                <tr key={k}>
                  {r.map((c, j) => (
                    <td key={j} className={c === '✓' ? 'yes' : c === '✗' ? 'no' : 'k'}>
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
