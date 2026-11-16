import { Fragment, useContext } from 'react';
import { RICH_RE as RE } from '../lib/rich';
import { WordTapContext } from './wordTapContext';

export { plain } from '../lib/rich';

// [[класс|текст]] → <span class="r-класс">текст</span>.
// Внутри урока (есть WordTapContext и tap !== false) корейские слова становятся кнопками разбора.
// Слово берётся целиком по «чистому» тексту, даже если разметка режет его: 학생[[b|이에요]] → 학생이에요.

const HANGUL = /[가-힣]+/g;

export function Rich({ text, tap = true }: { text: string; tap?: boolean }) {
  const ctx = useContext(WordTapContext);
  const active = !!ctx && tap;

  // Разметка → сегменты чистого текста
  const segs: { text: string; cls?: string }[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    if (m.index! > last) segs.push({ text: text.slice(last, m.index) });
    segs.push({ text: m[2], cls: `r-${m[1]}` });
    last = m.index! + m[0].length;
  }
  if (last < text.length) segs.push({ text: text.slice(last) });

  if (!active) return <Fragment>{segs.map((s, k) => (s.cls ? <span key={k} className={s.cls}>{s.text}</span> : <Fragment key={k}>{s.text}</Fragment>))}</Fragment>;

  // Для каждой позиции чистого текста — слово, которому она принадлежит
  const full = segs.map((s) => s.text).join('');
  const wordAt: string[] = new Array(full.length).fill('');
  for (const m of full.matchAll(HANGUL)) for (let i = m.index!; i < m.index! + m[0].length; i++) wordAt[i] = m[0];

  let offset = 0;
  return (
    <Fragment>
      {segs.map((s, k) => {
        const parts: React.ReactNode[] = [];
        let pos = 0;
        for (const m of s.text.matchAll(HANGUL)) {
          if (m.index! > pos) parts.push(s.text.slice(pos, m.index));
          const word = wordAt[offset + m.index!];
          parts.push(
            <span
              key={m.index}
              role="button"
              tabIndex={0}
              className="tw"
              onClick={(e) => {
                e.stopPropagation();
                ctx!.open(word);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  ctx!.open(word);
                }
              }}
            >
              {m[0]}
            </span>,
          );
          pos = m.index! + m[0].length;
        }
        if (pos < s.text.length) parts.push(s.text.slice(pos));
        offset += s.text.length;
        return s.cls ? (
          <span key={k} className={s.cls}>
            {parts}
          </span>
        ) : (
          <Fragment key={k}>{parts}</Fragment>
        );
      })}
    </Fragment>
  );
}
