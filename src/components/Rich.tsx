import { Fragment } from 'react';
import { RICH_RE as RE } from '../lib/rich';

export { plain } from '../lib/rich';

// [[класс|текст]] → <span class="r-класс">текст</span>

export function Rich({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    out.push(
      <span key={m.index} className={`r-${m[1]}`}>
        {m[2]}
      </span>,
    );
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}
