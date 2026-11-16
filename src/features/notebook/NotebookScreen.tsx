import { useState } from 'react';
import { Rich } from '../../components/Rich';
import { TabBar } from '../../components/TabBar';
import { LESSON_BY_ID } from '../../content/catalog';
import { ERROR_LABEL } from '../../content/types';
import { CLOSE_AFTER, isNoteDue, isOpen, type ErrorNote } from '../../lib/notebook';
import { speak } from '../../lib/sound';
import { useSchool } from '../../state/store';

export function NotebookScreen() {
  const s = useSchool();
  const notes = Object.values(s.notes).sort((a, b) => Number(!isOpen(a)) - Number(!isOpen(b)) || a.due.localeCompare(b.due));
  const due = notes.filter((n) => isNoteDue(n));
  const [session, setSession] = useState<string[] | null>(null);

  if (session) return <Drill ids={session} onEnd={() => setSession(null)} />;

  const byType = new Map<string, number>();
  for (const n of notes.filter(isOpen)) byType.set(n.type, (byType.get(n.type) ?? 0) + 1);

  return (
    <div className="app">
      <div className="page-title pad">
        <h1 className="kr">오답노트</h1>
        <p>Тетрадь ошибок. Запись закрывается после {CLOSE_AFTER} верных ответов в разные дни.</p>
      </div>
      {notes.length === 0 ? (
        <div className="empty">
          <b>Чистая тетрадь</b>
          Ошибки из уроков будут попадать сюда автоматически.
        </div>
      ) : (
        <>
          <div className="pad" style={{ paddingBlock: '6px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byType.size > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[...byType].map(([t, c]) => (
                  <span key={t} className="chip">
                    {ERROR_LABEL[t as ErrorNote['type']]} <b>{c}</b>
                  </span>
                ))}
              </div>
            )}
            <button className="cta" disabled={!due.length} onClick={() => setSession(due.map((n) => n.id))}>
              {due.length ? `Отработать ${due.length} ${due.length === 1 ? 'запись' : 'записей'}` : 'На сегодня всё отработано'}
            </button>
          </div>
          <ul className="notes">
            {notes.map((n) => (
              <li key={n.id} className={`note-item${isOpen(n) ? '' : ' closed'}`}>
                <div className="row">
                  <span>
                    {ERROR_LABEL[n.type]} · {LESSON_BY_ID[n.lessonId]?.short ?? 'урок'}
                  </span>
                  {isOpen(n) ? (
                    <span className="streak" aria-label={`Верных ответов подряд: ${n.streak} из ${CLOSE_AFTER}`}>
                      {Array.from({ length: CLOSE_AFTER }, (_, k) => (
                        <i key={k} className={k < n.streak ? 'on' : ''} />
                      ))}
                    </span>
                  ) : (
                    <span className="seal">해결</span>
                  )}
                </div>
                <div className="kr" style={{ fontSize: 16 }}>
                  {n.item.audio ? `▶ ${n.item.audio}` : <Rich text={n.item.prompt} />}
                </div>
                <div style={{ fontSize: 14 }}>
                  <span className="wrong">{n.wrong}</span> → <span className="right">{n.item.options[n.item.answer]}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="spacer" />
      <TabBar />
    </div>
  );
}

export function Drill({ ids, onEnd }: { ids: string[]; onEnd(): void }) {
  const s = useSchool();
  const [k, setK] = useState(0);
  const [ans, setAns] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const n = s.notes[ids[k]];
  if (!n || k >= ids.length) {
    return (
      <div className="app">
        <div className="page-title pad">
          <h1 className="kr">종례</h1>
        </div>
        <div className="empty">
          <b>
            {right} из {ids.length}
          </b>
          Верные ответы продвигают запись к закрытию, ошибки возвращают её на завтра.
          <div style={{ marginTop: 14 }}>
            <button className="btn-link" onClick={onEnd}>
              К тетради
            </button>
          </div>
        </div>
      </div>
    );
  }
  const it = n.item;
  const choose = (o: number) => {
    setAns(o);
    const ok = o === it.answer;
    if (ok) setRight((r) => r + 1);
    s.answerNote(n.id, ok);
  };
  return (
    <div className="app">
      <header className="lhead pad">
        <button className="iconbtn" aria-label="Закрыть" onClick={onEnd}>
          <svg viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="t">
          <small>종례 · работа над ошибками</small>
          <b>
            {k + 1} из {ids.length}
          </b>
        </div>
      </header>
      <div className="sheetbox">
        <h4>{ERROR_LABEL[n.type]}</h4>
        {it.audio && (
          <button className="play" onClick={() => speak(it.audio!)}>
            ▶ Слушать
          </button>
        )}
        {it.prompt !== '___' && (
          <p className="q">
            <Rich text={it.prompt.replace('___', ans === null ? '___' : it.options[it.answer])} />
            {it.ru && <span className="ru">{it.ru}</span>}
          </p>
        )}
        <div className="opts">
          {it.options.map((o, j) => (
            <button
              key={o}
              className={`opt${it.options.some((x) => x.length > 10) ? ' wide' : ''}${ans !== null && j === it.answer ? ' right' : ''}${ans === j && j !== it.answer ? ' wrong' : ''}`}
              disabled={ans !== null}
              onClick={() => choose(j)}
            >
              {o}
            </button>
          ))}
        </div>
        {ans !== null && (
          <div className={`fb${ans === it.answer ? '' : ' bad'}`}>
            <span className="pen">{ans === it.answer ? '맞아요!' : `→ ${it.options[it.answer]}`}</span>
            <Rich text={it.why} />
          </div>
        )}
      </div>
      <div className="lfoot pad">
        <button
          className="cta"
          disabled={ans === null}
          onClick={() => {
            setK(k + 1);
            setAns(null);
          }}
        >
          {k === ids.length - 1 ? 'Завершить' : 'Дальше'}
        </button>
      </div>
    </div>
  );
}
