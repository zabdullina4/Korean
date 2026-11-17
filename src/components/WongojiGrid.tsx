import { layout } from '../lib/wongoji';

/** Бланк 원고지: 20 клеток в строке, как на TOPIK II. */
export function WongojiGrid({ text, cols = 20, minRows = 0 }: { text: string; cols?: number; minRows?: number }) {
  const rows = layout(text, cols);
  while (rows.length < minRows) rows.push([]);
  return (
    <div className="wg-wrap">
      <div className="wg" style={{ ['--cols' as string]: cols }} role="img" aria-label={`Текст на бланке 원고지: ${text}`}>
        {rows.map((r, i) => (
          <div className="wg-row" key={i}>
            {Array.from({ length: cols }, (_, k) => {
              const c = r[k];
              return (
                <span key={k} className={`wg-cell${c ? ` wg-${c.kind}` : ''}`}>
                  {c?.text}
                </span>
              );
            })}
            {(i + 1) % 5 === 0 && <span className="wg-num">{(i + 1) * cols}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
