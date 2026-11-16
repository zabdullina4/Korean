import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabBar } from '../../components/TabBar';
import { LESSON_BY_ID } from '../../content/catalog';
import { POS_LABEL, type DictEntry } from '../../content/dictionary';
import { dict, search } from '../../lib/dictionary';
import type { Analysis, MorphKind } from '../../lib/morph';
import { useSchool } from '../../state/store';

const RECENT_KEY = 'hakgyo-dict-recent';
const EXAMPLES = ['먹었으니까', '도서관에서는', '사세요', '들어요', '학생는', '제가', '어제 친구를 만났어요', 'школа'];

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}
function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* хранилище недоступно — не страшно */
  }
}

export const KIND_LABEL: Record<MorphKind, string> = {
  stem: 'основа',
  honor: 'почтительность',
  tense: 'время',
  ending: 'окончание',
  particle: 'частица',
  copula: 'связка',
};

export function MorphChain({ a, onLesson }: { a: Analysis; onLesson?(id: string): void }) {
  return (
    <div className="chain" role="list">
      {a.chain.map((m, k) => (
        <div key={k} role="listitem" className={`morph m-${m.kind}`}>
          <span className="m-form kr">{m.form}</span>
          <span className="m-kind">{KIND_LABEL[m.kind]}</span>
          <span className="m-gloss">{m.gloss}</span>
          {m.lessonId && LESSON_BY_ID[m.lessonId] && onLesson && (
            <button className="m-lesson" onClick={() => onLesson(m.lessonId!)}>
              урок: {LESSON_BY_ID[m.lessonId].short}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function DictionaryScreen() {
  const nav = useNavigate();
  const s = useSchool();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState(loadRecent);
  const res = useMemo(() => search(q), [q]);
  const inCards = (e: DictEntry) => !!s.cards[`${e.wordId ?? `d-${e.lemma}`}:kr-ru`];

  const remember = (v: string) => {
    const t = v.trim();
    if (!t) return;
    const next = [t, ...recent.filter((x) => x !== t)].slice(0, 8);
    setRecent(next);
    saveRecent(next);
  };
  const open = (lemma: string) => {
    remember(q);
    nav(`/word/${encodeURIComponent(lemma)}`);
  };

  const wordOfDay = useMemo(() => {
    const pool = dict().entries.filter((e) => e.level <= s.grade + 1 && e.pos !== 'expr');
    const day = Math.floor(Date.now() / 86400000);
    return pool[day % pool.length];
  }, [s.grade]);

  return (
    <div className="app">
      <div className="page-title pad">
        <h1 className="kr">사전</h1>
        <p>Слово в любой форме, целая фраза или перевод по-русски.</p>
      </div>
      <form
        className="pad dict-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          remember(q);
        }}
      >
        <input
          id="dict-q"
          className="kr"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="먹었으니까 · 도서관에서 · школа"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Поиск в словаре"
        />
        {q && (
          <button type="button" className="clear" aria-label="Очистить" onClick={() => setQ('')}>
            ×
          </button>
        )}
      </form>

      {!q.trim() && (
        <div className="pad dict-home">
          {wordOfDay && (
            <button className="wod" onClick={() => open(wordOfDay.lemma)}>
              <span className="lbl">오늘의 단어 · слово дня</span>
              <span className="kr big">{wordOfDay.lemma}</span>
              <span>{wordOfDay.ru}</span>
            </button>
          )}
          <h4>Попробуйте</h4>
          <div className="chips">
            {EXAMPLES.map((x) => (
              <button key={x} className="chip kr" onClick={() => setQ(x)}>
                {x}
              </button>
            ))}
          </div>
          {recent.length > 0 && (
            <>
              <h4>Недавние</h4>
              <div className="chips">
                {recent.map((x) => (
                  <button key={x} className="chip kr" onClick={() => setQ(x)}>
                    {x}
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="dict-note">В словаре {dict().entries.length} слов уровней 0–2급. Разбор понимает формы из уроков: время, вежливость, окончания, частицы.</p>
        </div>
      )}

      {res.tokens.length > 0 && (
        <div className="pad analyses">
          {res.tokens.map(({ token, analyses }, ti) => (
            <section key={ti} className="analysis">
              <h3 className="kr">{token}</h3>
              {analyses.length === 0 && <p className="muted">Не удалось разобрать: такой формы нет среди изученных конструкций или слова нет в учебном словаре.</p>}
              {analyses.slice(0, 3).map((a, k) => (
                <div key={k} className="variant">
                  {analyses.length > 1 && <div className="vlabel">Вариант {k + 1}{a.entry ? ` · ${a.entry.ru}` : ''}</div>}
                  <MorphChain a={a} onLesson={(id) => nav(`/lesson/${id}`)} />
                  {a.warning && <p className="warn">⚠ {a.warning}</p>}
                  {a.note && a.note !== 'словарная форма' && <p className="mnote">{a.note}</p>}
                  {a.entry && (
                    <button className="btn-link" onClick={() => open(a.lemma)}>
                      Статья «{a.lemma}» ›
                    </button>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {res.entries.length > 0 && (
        <>
          <div className="sec pad">
            <h2 className="kr">단어</h2>
            <span>{res.entries.length} в словаре</span>
          </div>
          <ul className="notes">
            {res.entries.map((e) => (
              <li key={e.lemma}>
                <button className="note-item entry-row" onClick={() => open(e.lemma)}>
                  <div className="row">
                    <span>
                      {POS_LABEL[e.pos]} · {e.level === 0 ? '예비반' : `${e.level}급`}
                    </span>
                    {inCards(e) && <span className="tick">в карточках</span>}
                  </div>
                  <div>
                    <span className="kr" style={{ fontSize: 19 }}>
                      {e.lemma}
                    </span>{' '}
                    <span style={{ color: 'var(--ink-2)' }}>{e.ru}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {q.trim() && res.tokens.length === 0 && res.entries.length === 0 && (
        <div className="empty">
          <b>Ничего не найдено</b>
          Попробуйте другую форму слова или поиск по-русски.
        </div>
      )}
      <div className="spacer" />
      <TabBar />
    </div>
  );
}
