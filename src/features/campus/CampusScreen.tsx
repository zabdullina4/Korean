import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from '../../components/TabBar';
import { toast } from '../../components/toast';
import { GRADES, gradeLessons } from '../../content/catalog';
import type { SkillKey } from '../../content/types';
import { buildDay, stats, type Slot } from '../../lib/plan';
import { bell } from '../../lib/sound';
import { useSchool } from '../../state/store';
import { CampusScene, type BuildingId, type BuildingView } from './CampusScene';

const SKILL: Record<SkillKey, { kr: string; color: string; light?: boolean }> = {
  read: { kr: '읽기', color: 'var(--hwang)' },
  listen: { kr: '듣기', color: 'var(--cheong)' },
  write: { kr: '쓰기', color: 'var(--baek)', light: true },
  speak: { kr: '말하기', color: 'var(--jeok)' },
  core: { kr: '어휘·문법', color: 'var(--heuk)' },
};

const WEEKDAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

function greeting(d: Date) {
  const h = d.getHours();
  if (h < 5 || h >= 22) return '늦은 밤이에요';
  if (h < 12) return '좋은 아침이에요!';
  if (h < 18) return '안녕하세요!';
  return '좋은 저녁이에요!';
}

/** Корейский учебный год: 1학기 с марта, 2학기 с сентября. */
function semester(d: Date) {
  const m = d.getMonth();
  const start = m >= 2 && m < 8 ? new Date(d.getFullYear(), 2, 1) : new Date(m >= 8 ? d.getFullYear() : d.getFullYear() - 1, 8, 1);
  const week = Math.floor((d.getTime() - start.getTime()) / (7 * 86400000)) + 1;
  return `${m >= 2 && m < 8 ? 1 : 2}학기 · ${week}주차`;
}

export function CampusScreen() {
  const s = useSchool();
  const nav = useNavigate();
  const loc = useLocation();
  const fresh = (loc.state as { fresh?: boolean } | null)?.fresh ?? false;
  const now = new Date();
  const day = useMemo(() => buildDay(s), [s]);
  const st = stats(s);
  const currentId = `g${s.grade}` as BuildingId;
  const [sel, setSel] = useState<BuildingId>(currentId);

  const views = useMemo(() => {
    const v = {} as Record<BuildingId, BuildingView>;
    for (const g of GRADES) {
      const lessons = gradeLessons(g.n);
      const next = lessons.find((l) => !s.lessons[l.id]);
      const windows = lessons.map((l) => (s.lessons[l.id] ? 1 : g.n === s.grade && l === next ? 0.5 : 0));
      v[`g${g.n}` as BuildingId] = { label: `${g.name}, ${g.ru}`, windows, fog: g.n > s.grade };
    }
    v.lib = { label: '도서관, Библиотека', windows: [1, 1, 0, 1, 0, 0], fog: false };
    v.club = { label: '동아리관, Клубы', windows: [0, 1, 1, 0, 0, 0, 0, 0], fog: false };
    v.yard = { label: '운동장, Двор с тренажёрами', windows: [], fog: false };
    return v;
  }, [s]);

  const run = (x: Slot) => {
    if (x.action.type === 'lesson') {
      if (s.bell) bell();
      nav(`/lesson/${x.action.lessonId}`);
    } else if (x.action.type === 'review') nav('/cards');
    else if (x.action.type === 'notebook') nav('/notebook');
    else if (x.status === 'done') toast('Этот блок на сегодня выполнен');
    else toast(`«${x.title}» появится в следующих версиях`);
  };

  const left = day.filter((x) => x.status === 'todo' || x.status === 'next').reduce((a, c) => a + c.minutes, 0);

  return (
    <div className="app">
      <header className="top pad">
        <div className="date">
          <b>
            {now.getMonth() + 1}월 {now.getDate()}일 {WEEKDAY[now.getDay()]}
          </b>{' '}
          · {semester(now)}
        </div>
        <div className="top-r">
          <span className="chip">
            출석 <b>{s.attendance.length}</b> дн.
          </span>
          <button
            className="iconbtn"
            aria-pressed={s.bell}
            aria-label="Школьный звонок"
            onClick={() => {
              s.toggleBell();
              if (!s.bell) bell();
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </button>
        </div>
      </header>

      <div className="hello pad">
        <h1 className="kr">{greeting(now)}</h1>
        <p>
          {GRADES[s.grade].name} · {left ? `сегодня осталось ${left} мин` : 'план на сегодня выполнен'}
        </p>
      </div>

      <div className="scene-wrap">
        <CampusScene views={views} current={currentId} selected={sel} fresh={fresh} onSelect={setSel} />
      </div>
      <BuildingInfo id={sel} current={s.grade} />

      <div className="sec pad">
        <h2 className="kr">오늘의 시간표</h2>
        <span>расписание на сегодня</span>
      </div>
      <ul className="tt">
        {day.map((x) => {
          const sk = SKILL[x.skill];
          return (
            <li key={x.id}>
              <button className={`slot ${x.status === 'soon' ? '' : x.status}`} onClick={() => run(x)}>
                <div className="per">
                  {x.per}
                  <small>{x.time || ' '}</small>
                </div>
                <div className="what">
                  <b>{x.title}</b>
                  <span>
                    <i className={`sk${sk.light ? ' light' : ''}`} style={{ ['--c' as string]: sk.color }}>
                      {sk.kr}
                    </i>
                    {x.detail}
                  </span>
                </div>
                <div className="st">
                  {x.status === 'done' ? (
                    <span className="tick" aria-label="Готово">
                      ✓
                    </span>
                  ) : x.status === 'next' ? (
                    <span className="go">Начать ›</span>
                  ) : x.status === 'soon' ? (
                    'скоро'
                  ) : (
                    `${x.minutes} мин`
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sec pad">
        <h2 className="kr">성적표</h2>
        <span>зачётка · {GRADES[s.grade].name}</span>
      </div>
      <div className="gb">
        {[
          ['수업', 'Уроки класса', st.lessonsDone, st.lessonsTotal, 'var(--heuk)'],
          ['단어', 'Слова: выучено из встреченных', st.known, st.words, 'var(--hwang)'],
          ['오답', 'Ошибки: закрыто из всех', st.notesClosed, st.notesClosed + st.notesOpen, 'var(--jeok)'],
        ].map(([kr, ru, a, b, c]) => (
          <div className="gb-row" key={kr as string}>
            <span className="kr">{kr}</span>
            <div className="bar" role="img" aria-label={`${ru}: ${a} из ${b}`}>
              <i style={{ ['--c' as string]: c as string, width: `${b ? ((a as number) / (b as number)) * 100 : 0}%` }} />
            </div>
            <span className="v">
              {a}/{b}
            </span>
          </div>
        ))}
        <div className="gb-foot">
          <span>
            Слов в долгой памяти (21+ дн): <b>{st.mature}</b>
          </span>
          <span>
            Учебных дней: <b>{s.attendance.length}</b>
          </span>
        </div>
      </div>
      <div className="spacer" />
      <TabBar />
    </div>
  );
}

function BuildingInfo({ id, current }: { id: BuildingId; current: number }) {
  const nav = useNavigate();
  const s = useSchool();
  if (id.startsWith('g')) {
    const n = Number(id.slice(1));
    const g = GRADES[n];
    const lessons = gradeLessons(n);
    const done = lessons.filter((l) => s.lessons[l.id]).length;
    const preview = n > current && lessons.length > 0;
    return (
      <div className="info">
        <div className="badge kr">{n === 0 ? '0급' : g.name}</div>
        <div className="grow">
          <h3>
            <span className="kr">{g.name}</span> · {g.ru}
          </h3>
          <p>
            {n === current
              ? `Пройдено уроков: ${done} из ${lessons.length}`
              : n < current
                ? 'Класс окончен'
                : lessons.length
                  ? 'Закрыто. Доступно превью урока'
                  : 'Закрыто. Программа класса готовится'}
          </p>
          {lessons.length > 0 && n === current && (
            <div className="meter" aria-label={`Пройдено ${done} из ${lessons.length}`}>
              <i style={{ width: `${(done / lessons.length) * 100}%` }} />
            </div>
          )}
          <div className="act">
            {n === current && (
              <button className="btn-link" onClick={() => nav(`/grade/${n}`)}>
                Программа класса
              </button>
            )}
            {preview && (
              <button className="btn-link" onClick={() => nav(`/lesson/${lessons[0].id}`)}>
                Открыть превью: {lessons[0].short}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  const other: Record<string, [string, string, string, string]> = {
    lib: ['책', '도서관', 'Библиотека', 'Книги и тексты по уровню появятся в следующей версии'],
    club: ['반', '동아리관', 'Клубы', 'Дорамы, K-pop, бизнес-корейский — откроются с 1급'],
    yard: ['놀', '운동장', 'Двор', 'Микро-тренажёры: числа, нерегулярные глаголы, вежливость'],
  };
  const [badge, kr, ru, text] = other[id];
  return (
    <div className="info">
      <div className="badge kr">{badge}</div>
      <div className="grow">
        <h3>
          <span className="kr">{kr}</span> · {ru}
        </h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

