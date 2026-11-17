import { Navigate, useNavigate } from 'react-router-dom';
import { EXAMS } from '../../content/catalog';
import { diplomaNo, diplomaRows, scaled, skillProfile, topik2Level } from '../../lib/graduation';
import { stats } from '../../lib/plan';
import { LAST_GRADE, useSchool } from '../../state/store';

const PETALS = Array.from({ length: 14 }, (_, i) => i);

function krDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 졸업식: церемония и аттестат выпускника. Открывается только после выпускного экзамена 6급. */
export function GraduationScreen() {
  const s = useSchool();
  const nav = useNavigate();
  if (!s.graduated) return <Navigate to="/" replace />;

  const rows = diplomaRows(s);
  const skills = skillProfile(s);
  const st = stats(s);
  const finalExam = EXAMS[LAST_GRADE];
  const finalBest = (s.exams[finalExam.id] ?? []).filter((a) => a.passed).reduce<number>((m, a) => Math.max(m, scaled(finalExam, a)), 0);
  const level = topik2Level(finalBest);
  const lessonsDone = rows.reduce((n, r) => n + r.lessonsDone, 0);

  return (
    <div className="app grad">
      <header className="lhead pad no-print">
        <button className="iconbtn" aria-label="Назад" onClick={() => nav('/')}>
          <svg viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="t">
          <small>졸업식 · выпускной</small>
          <b>Школа окончена</b>
        </div>
      </header>

      <section className="grad-hero no-print" aria-label="Церемония">
        <div className="petals" aria-hidden="true">
          {PETALS.map((i) => (
            <i key={i} style={{ ['--i' as string]: i }} />
          ))}
        </div>
        <h1 className="kr">졸업을 축하합니다!</h1>
        <p>
          От первой буквы хангыля до эссе на высокий балл: {lessonsDone} уроков, семь экзаменов и {s.attendance.length} учебных дней.
        </p>
        <blockquote>
          <p className="kr">“여러분은 이제 한국어로 생각하고, 읽고, 쓸 수 있는 사람이 되었습니다. 배움은 오늘 끝나는 것이 아니라 오늘부터 새로 시작됩니다.”</p>
          <p>«Теперь вы умеете думать, читать и писать по-корейски. Учёба не кончается сегодня — сегодня она начинается заново».</p>
          <cite>— 담임 선생님, классный руководитель</cite>
        </blockquote>
      </section>

      <article className="diploma" aria-label="Аттестат">
        <div className="d-no kr">{diplomaNo(s.graduated)}</div>
        <h2 className="kr">졸 업 장</h2>
        <p className="d-text kr">위 학생은 한국어 학교 예비반부터 6급까지의 전 과정을 성실히 마쳤기에 이 졸업장을 수여합니다.</p>
        <p className="d-ru">Выдан в том, что выпускник прошёл полный курс школы — от 예비반 до 6급.</p>

        <table className="d-table">
          <thead>
            <tr>
              <th>Класс</th>
              <th>Уроки</th>
              <th>Экзамен</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.grade}>
                <td className="kr">{r.name}</td>
                <td>
                  {r.lessonsDone}/{r.lessonsTotal}
                </td>
                <td>{r.score === null ? '—' : r.scale === 100 ? `${r.score}%` : `${r.score}/${r.scale}`}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-skills">
          {(
            [
              ['듣기', 'Аудирование', skills.listen, 'var(--cheong)'],
              ['읽기', 'Чтение', skills.read, 'var(--hwang)'],
              ['쓰기', 'Письмо', skills.write, 'var(--jeok)'],
            ] as const
          ).map(([kr, ru, v, c]) => (
            <div className="gb-row" key={kr}>
              <span className="kr">{kr}</span>
              <div className="bar" role="img" aria-label={`${ru}: ${v ?? 0}%`}>
                <i style={{ ['--c' as string]: c, width: `${v ?? 0}%` }} />
              </div>
              <span className="v">{v === null ? '—' : `${v}%`}</span>
            </div>
          ))}
          <p className="d-note">Средняя доля верных ответов по разделу во всех сданных экзаменах.</p>
        </div>

        <p className="d-level">
          {level
            ? `Выпускной экзамен: ${finalBest}/300 — на настоящем TOPIK II это уровень ${level}급.`
            : `Выпускной экзамен: ${finalBest}/300.`}
        </p>

        <div className="d-foot">
          <span className="kr">{krDate(s.graduated)}</span>
          <span className="kr d-sign">
            한국어 학교장
            <i className="seal" aria-hidden="true">
              學
            </i>
          </span>
        </div>
      </article>

      <div className="sec pad no-print">
        <h2 className="kr">졸업 후</h2>
        <span>что дальше</span>
      </div>
      <ul className="grad-next no-print">
        <li>
          <b>Карточки и 오답노트 продолжают работать.</b> В долгой памяти уже {st.mature} слов — FSRS будет напоминать их и дальше.
        </li>
        <li>
          <b>Все уроки открыты для повторения.</b> Программа любого класса — в кампусе, прогресс сохраняется.
        </li>
        <li>
          <b>Настоящий TOPIK II.</b> Выпускной экзамен устроен как он: те же разделы, шкала 300 и порог 230 для 6급.
        </li>
      </ul>

      <div className="lfoot pad no-print" style={{ display: 'grid', gap: 8 }}>
        <button className="cta" onClick={() => window.print()}>
          Распечатать аттестат
        </button>
        <button className="cta" style={{ background: 'var(--board-2)' }} onClick={() => nav('/')}>
          В кампус
        </button>
      </div>
    </div>
  );
}
