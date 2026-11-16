import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { POS_LABEL } from '../content/dictionary';
import { analyze } from '../lib/dictionary';
import type { MorphKind } from '../lib/morph';
import { speak } from '../lib/sound';
import { useSchool } from '../state/store';
import { WordTapContext } from './wordTapContext';

const KIND: Record<MorphKind, string> = { stem: 'основа', honor: 'почтит.', tense: 'время', ending: 'окончание', particle: 'частица', copula: 'связка' };

/** Даёт урокам нажимаемые слова и показывает разбор в нижней панели, не уходя из урока. */
export function WordTapProvider({ children }: { children: ReactNode }) {
  const [word, setWord] = useState<string | null>(null);
  const value = useMemo(() => ({ open: (w: string) => setWord(w) }), []);
  return (
    <WordTapContext.Provider value={value}>
      {children}
      {word && <WordSheet word={word} onClose={() => setWord(null)} />}
    </WordTapContext.Provider>
  );
}

function WordSheet({ word, onClose }: { word: string; onClose(): void }) {
  const s = useSchool();
  const analyses = useMemo(() => analyze(word).slice(0, 2), [word]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const lemmas = [...new Map(analyses.filter((a) => a.entry).map((a) => [a.lemma, a.entry!])).values()];

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`Разбор: ${word}`}>
        <div className="sheet-head">
          <button className="kr sheet-word" onClick={() => speak(word)} aria-label={`${word}, прослушать`}>
            {word} <span aria-hidden="true">▶</span>
          </button>
          <button ref={closeRef} className="iconbtn" aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
        </div>
        {analyses.length === 0 && <p className="muted">Этой формы нет среди изученных конструкций.</p>}
        {analyses.map((a, k) => (
          <div key={k} className="variant">
            {analyses.length > 1 && <div className="vlabel">Вариант {k + 1}</div>}
            <div className="chain compact">
              {a.chain.map((m, j) => (
                <div key={j} className={`morph m-${m.kind}`}>
                  <span className="m-form kr">{m.form}</span>
                  <span className="m-kind">{KIND[m.kind]}</span>
                  <span className="m-gloss">{m.gloss}</span>
                </div>
              ))}
            </div>
            {a.warning && <p className="warn">⚠ {a.warning}</p>}
            {a.note && a.note !== 'словарная форма' && <p className="mnote">{a.note}</p>}
          </div>
        ))}
        {lemmas.map((e) => {
          const id = e.wordId ?? `d-${e.lemma}`;
          const added = !!s.cards[`${id}:kr-ru`];
          return (
            <div key={e.lemma} className="sheet-entry">
              <div>
                <span className="kr" style={{ fontSize: 18 }}>
                  {e.lemma}
                </span>{' '}
                <span style={{ color: 'var(--ink-2)' }}>{e.ru}</span>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {POS_LABEL[e.pos]}
                  {e.pron ? ` · ${e.pron}` : ''}
                </div>
              </div>
              <button className="go" disabled={added} onClick={() => s.addWords([{ id, kr: e.lemma, ru: e.ru, pron: e.pron }])}>
                {added ? '✓ в 단어장' : '+ в 단어장'}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
