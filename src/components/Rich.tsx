import { Fragment } from 'react';

// Мини-разметка контента: [[класс|текст]] → <span class="r-класс">текст</span>.
// Негативный просмотр вперёд позволяет писать квадратные скобки внутри: [[b|[부억]]].
const RE = /\[\[(\w+)\|(.+?)\]\](?!\])/g;

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

export function plain(text: string): string {
  return text.replace(RE, '$2');
}
