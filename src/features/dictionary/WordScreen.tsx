import { useNavigate, useParams } from 'react-router-dom';
import { TabBar } from '../../components/TabBar';
import { toast } from '../../components/toast';
import { LESSON_BY_ID } from '../../content/catalog';
import { POS_LABEL } from '../../content/dictionary';
import { irregularType } from '../../lib/conjugate';
import { entry, examples } from '../../lib/dictionary';
import { paradigm } from '../../lib/morph';
import { speak } from '../../lib/sound';
import { useSchool } from '../../state/store';

const IRREG: Record<string, string> = {
  ㅂ: 'ㅂ-нерегулярный глагол',
  ㄷ: 'ㄷ-нерегулярный глагол',
  ㅅ: 'ㅅ-нерегулярный глагол',
  ㅎ: 'ㅎ-нерегулярный глагол',
  르: '르-нерегулярный глагол',
  ㄹ: 'основа на ㄹ (ㄹ выпадает перед ㄴ, ㅂ, ㅅ)',
  ㅡ: 'ㅡ выпадает перед -아/어',
  하다: '하다-глагол: 하 + -여 → 해',
};

export function WordScreen() {
  const { lemma = '' } = useParams();
  const e = entry(decodeURIComponent(lemma));
  const nav = useNavigate();
  const s = useSchool();
  if (!e) {
    return (
      <div className="app">
        <div className="empty" style={{ marginTop: 40 }}>
          <b>Слова нет в словаре</b>
          <button className="btn-link" onClick={() => nav('/dictionary')}>
            К поиску
          </button>
        </div>
      </div>
    );
  }
  const wordId = e.wordId ?? `d-${e.lemma}`;
  const added = !!s.cards[`${wordId}:kr-ru`];
  const table = paradigm(e.lemma, e.pos);
  const ex = examples(e.lemma);
  let irr: string | null = null;
  try {
    irr = e.lemma.endsWith('다') && table.length ? irregularType(e.lemma) : null;
  } catch {
    irr = null;
  }

  return (
    <div className="app">
      <header className="lhead pad">
        <button className="iconbtn" aria-label="Назад" onClick={() => nav(-1)}>
          <svg viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="t">
          <small>사전 · статья</small>
          <b>
            {POS_LABEL[e.pos]} · {e.level === 0 ? '예비반' : `${e.level}급`}
          </b>
        </div>
      </header>
      <section className="word-head pad">
        <button className="kr lemma" onClick={() => speak(e.lemma)} aria-label={`${e.lemma}, прослушать`}>
          {e.lemma} <span aria-hidden="true">▶</span>
        </button>
        <div className="meta">
          {e.pron && <span className="kr">{e.pron}</span>}
          {e.hanja && <span className="hanja">{e.hanja}</span>}
        </div>
        <p className="ru">{e.ru}</p>
        {irr && <p className="mnote">{IRREG[irr]}</p>}
        <button
          className={`cta${added ? ' done' : ''}`}
          disabled={added}
          onClick={() => {
            s.addWords([{ id: wordId, kr: e.lemma, ru: e.ru, pron: e.pron }]);
            toast('Добавлено в 단어장: две карточки, КР→РУ и РУ→КР');
          }}
        >
          {added ? 'В карточках ✓' : 'Добавить в карточки'}
        </button>
      </section>

      {table.length > 0 && (
        <>
          <div className="sec pad">
            <h2 className="kr">활용</h2>
            <span>формы</span>
          </div>
          <div className="gb paradigm">
            {table.map((r) => (
              <button key={r.label} className="p-row" onClick={() => speak(r.form)}>
                <span>{r.label}</span>
                <span className="kr">{r.form}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {ex.length > 0 && (
        <>
          <div className="sec pad">
            <h2 className="kr">예문</h2>
            <span>примеры из уроков</span>
          </div>
          <ul className="notes">
            {ex.map((x, k) => (
              <li key={k} className="note-item">
                <button className="kr ex-kr" onClick={() => speak(x.kr)}>
                  {x.kr}
                </button>
                {x.ru && <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{x.ru}</div>}
                <button className="btn-link" style={{ justifySelf: 'start' }} onClick={() => nav(`/lesson/${x.lessonId}`)}>
                  {LESSON_BY_ID[x.lessonId]?.short}
                </button>
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
