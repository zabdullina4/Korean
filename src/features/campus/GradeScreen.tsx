import { useNavigate, useParams } from 'react-router-dom';
import { TabBar } from '../../components/TabBar';
import { EXAMS, GRADES, LESSON_BY_ID } from '../../content/catalog';
import { useSchool } from '../../state/store';

/** Программа класса: юниты и уроки. Внутри класса уроки открыты все (мягкий барьер). */
export function GradeScreen() {
  const { n = '0' } = useParams();
  const g = GRADES[Number(n)];
  const s = useSchool();
  const nav = useNavigate();
  if (!g) return null;
  return (
    <div className="app">
      <header className="lhead pad">
        <button className="iconbtn" aria-label="Назад" onClick={() => nav('/')}>
          <svg viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="t">
          <small>Программа класса</small>
          <b>
            <span className="kr">{g.name}</span> · {g.ru}
          </b>
        </div>
      </header>
      <div className="unit-list">
        {g.units.map((u) => (
          <section key={u.n} style={{ display: 'grid', gap: 6 }}>
            <div className="sec" style={{ paddingBlock: '12px 2px' }}>
              <h2 className="kr">
                {u.n}단원 · {u.titleKr}
              </h2>
              <span>{u.title}</span>
            </div>
            {u.lessons.length === 0 && (
              <div className="slot" style={{ opacity: 0.55 }}>
                <div className="per">
                  —<small>&nbsp;</small>
                </div>
                <div className="what">
                  <b>Уроки готовятся</b>
                  <span>Юнит появится в следующих версиях</span>
                </div>
                <div className="st">скоро</div>
              </div>
            )}
            {u.lessons.map((id, k) => {
              const l = LESSON_BY_ID[id];
              const r = s.lessons[id];
              return (
                <button key={id} className={`slot${r ? ' done' : ''}`} onClick={() => nav(`/lesson/${id}`)}>
                  <div className="per">
                    {k + 1}과<small>{l.minutes} мин</small>
                  </div>
                  <div className="what">
                    <b>{l.short}</b>
                    <span>{l.title}</span>
                  </div>
                  <div className="st">{r ? <span className="tick">{r.score}</span> : <span className="go">›</span>}</div>
                </button>
              );
            })}
          </section>
        ))}
        {EXAMS[g.n] ? (
          <button className={`slot${(s.exams[EXAMS[g.n].id] ?? []).some((a) => a.passed) ? ' done' : ''}`} onClick={() => nav(`/exam/${EXAMS[g.n].id}`)}>
            <div className="per">
              시험<small>{EXAMS[g.n].minutes} мин</small>
            </div>
            <div className="what">
              <b className="kr">{EXAMS[g.n].titleKr}</b>
              <span>Переводной экзамен. Можно сдать экстерном в любой момент.</span>
            </div>
            <div className="st">
              {(s.exams[EXAMS[g.n].id] ?? []).some((a) => a.passed) ? <span className="tick">합격</span> : <span className="go">›</span>}
            </div>
          </button>
        ) : (
          <div className="slot" style={{ opacity: 0.6 }}>
            <div className="per">
              시험<small>&nbsp;</small>
            </div>
            <div className="what">
              <b>Переводной экзамен класса</b>
              <span>Появится, когда программа класса будет готова</span>
            </div>
            <div className="st">скоро</div>
          </div>
        )}
      </div>
      <div className="spacer" />
      <TabBar />
    </div>
  );
}
