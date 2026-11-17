import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabBar } from '../../components/TabBar';
import { reviewQueue } from '../../lib/plan';
import { formatInterval, preview, Rating, type Grade } from '../../lib/srs';
import { speak } from '../../lib/sound';
import { useSchool } from '../../state/store';

const BUTTONS: { g: Grade; label: string; cls: string }[] = [
  { g: Rating.Again, label: 'Снова', cls: 'again' },
  { g: Rating.Hard, label: 'Трудно', cls: '' },
  { g: Rating.Good, label: 'Помню', cls: 'good' },
  { g: Rating.Easy, label: 'Легко', cls: '' },
];

export function ReviewScreen() {
  const s = useSchool();
  const nav = useNavigate();
  // Очередь фиксируется на входе, чтобы карточки не прыгали во время сессии.
  const [queue, setQueue] = useState(() => reviewQueue(useSchool.getState()).all.map((c) => c.id));
  const [shown, setShown] = useState(false);
  const [doneCount, setDone] = useState(0);
  const card = queue.length ? s.cards[queue[0]] : null;
  const word = card ? s.words[card.wordId] : null;
  const times = useMemo(() => (card ? preview(card.fsrs) : null), [card]);

  const rate = (g: Grade) => {
    if (!card) return;
    s.reviewCard(card.id, g);
    const updated = useSchool.getState().cards[card.id];
    const soon = new Date(updated.fsrs.due).getTime() - Date.now() < 15 * 60000;
    setQueue((q) => (soon ? [...q.slice(1), q[0]] : q.slice(1)));
    setShown(false);
    setDone((d) => d + 1);
  };

  return (
    <div className="app">
      <div className="page-title pad">
        <h1 className="kr">단어장</h1>
        <p>{card ? `Осталось ${queue.length} · повторено ${doneCount}` : 'Карточки слов с интервальным повторением FSRS'}</p>
      </div>
      {!card || !word ? (
        <div className="empty">
          <b>{doneCount ? '오늘은 끝!' : 'Пока пусто'}</b>
          {doneCount
            ? `Повторено ${doneCount} карточек. FSRS вернёт каждую, когда вы начнёте её забывать.`
            : Object.keys(s.cards).length
              ? 'Сегодня повторять нечего: следующие карточки откроются позже.'
              : 'Слова из пройденных уроков появятся здесь автоматически.'}
          <div style={{ marginTop: 14 }}>
            <button className="btn-link" onClick={() => nav('/')}>
              Вернуться к расписанию
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flash" style={{ marginTop: 18 }}>
            <span className="dir">{card.dir === 'kr-ru' ? 'КР → РУ' : 'РУ → КР · вспомните и скажите вслух'}</span>
            {card.dir === 'kr-ru' ? (
              <button className="front kr" style={{ background: 'none', border: 0 }} onClick={() => speak(word.kr)} aria-label={`${word.kr}, прослушать`}>
                {word.kr}
              </button>
            ) : (
              <div className="front">{word.ru}</div>
            )}
            {shown && (
              <div className="back">
                {card.dir === 'kr-ru' ? (
                  <div style={{ fontSize: 20 }}>{word.ru}</div>
                ) : (
                  <button className="kr" style={{ background: 'none', border: 0 }} onClick={() => speak(word.kr)}>
                    {word.kr}
                  </button>
                )}
                {word.pron && <div className="pron">{word.pron}</div>}
                {word.note && <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{word.note}</div>}
              </div>
            )}
          </div>
          <div className="pad" style={{ paddingBlock: 16 }}>
            {!shown ? (
              <button
                className="cta"
                onClick={() => {
                  setShown(true);
                  if (card.dir === 'ru-kr') speak(word.kr);
                }}
              >
                Показать ответ
              </button>
            ) : (
              <div className="grades">
                {BUTTONS.map((b) => (
                  <button key={b.g} className={`grade ${b.cls}`} onClick={() => rate(b.g)}>
                    {b.label}
                    <small>{times && formatInterval(times[b.g])}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <TabBar />
    </div>
  );
}
