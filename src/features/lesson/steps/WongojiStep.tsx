import { Rich } from '../../../components/Rich';
import { WongojiGrid } from '../../../components/WongojiGrid';
import type { Step } from '../../../content/types';
import type { StepProps } from '../LessonPlayer';

type S = Extract<Step, { kind: 'wongoji' }>;

export function WongojiStep({ step }: StepProps<S>) {
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
        <WongojiGrid text={step.text} />
        <p className="wg-legend">
          <span className="wg-cell wg-indent" /> отступ абзаца · <span className="wg-cell wg-space" /> пробел · <span className="wg-cell wg-pair">20</span> две цифры
        </p>
        {step.note && (
          <p style={{ fontSize: 14, margin: '10px 0 0' }}>
            <Rich text={step.note} />
          </p>
        )}
      </div>
    </>
  );
}
