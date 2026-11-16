import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Rich } from '../../components/Rich';
import { EXAM_BY_ID, GRADES } from '../../content/catalog';
import { questionCount, type ExamQuestion, type ExamSection } from '../../content/exam';
import { grade, retakeStatus, seedFor, type Answer, type Graded } from '../../lib/exam';
import { bell, speak } from '../../lib/sound';
import { useSchool } from '../../state/store';
import { Drill } from '../notebook/NotebookScreen';

const NUM = ['①', '②', '③', '④'];

type Phase = { kind: 'intro' } | { kind: 'drill'; ids: string[] } | { kind: 'run'; seed: number; sections: ExamSection[]; endAt: number } | { kind: 'result'; result: Graded };

export function ExamScreen() {
  const { id = '' } = useParams();
  const exam = EXAM_BY_ID[id];
  const s = useSchool();
  const nav = useNavigate();
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  if (!exam) return null;
  const attempts = s.exams[exam.id] ?? [];
  const last = attempts[attempts.length - 1];
  const retake = retakeStatus(last, s.notes);
  const passedBefore = attempts.some((a) => a.passed);

  if (phase.kind === 'drill') return <Drill ids={phase.ids} onEnd={() => setPhase({ kind: 'intro' })} />;

  if (phase.kind === 'run')
    return (
      <ExamRun
        sections={phase.sections}
        endAt={phase.endAt}
        plays={exam.plays}
        title={exam.titleKr}
        onSubmit={(answers) => {
          const result = grade(exam, phase.seed, phase.sections, answers);
          s.finishExam(exam.id, exam.grade, result);
          if (s.bell) bell();
          setPhase({ kind: 'result', result });
          window.scrollTo(0, 0);
        }}
      />
    );

  if (phase.kind === 'result') {
    const { attempt, mistakes } = phase.result;
    const pct = Math.round((attempt.correct / attempt.total) * 100);
    return (
      <div className="app">
        <header className="lhead pad">
          <div className="t">
            <small>{exam.titleKr} · результат</small>
            <b>{exam.title}</b>
          </div>
        </header>
        <div className="sheetbox" style={{ backgroundImage: 'none', marginTop: 0 }}>
          <div className={`stamp${attempt.passed ? ' pass' : ''}`}>
            {attempt.passed ? '합격' : '불합격'}
            <small>
              {attempt.correct} / {attempt.total} · {pct}%
            </small>
          </div>
          <p style={{ textAlign: 'center', margin: '0 0 14px' }}>
            {attempt.passed
              ? s.promoted === exam.grade + 1
                ? `Поздравляем! Вы переведены в ${GRADES[exam.grade + 1].name}.`
                : 'Экзамен сдан.'
              : `Для зачёта нужно ${Math.round(exam.pass * 100)}%. Отработайте ошибки в 보충수업 — после этого откроется пересдача с новым вариантом.`}
          </p>
          <div className="gb" style={{ margin: 0 }}>
            {attempt.sections.map((sec) => {
              const def = sectionName(sec.key);
              return (
                <div className="gb-row" key={sec.key}>
                  <span className="kr">{def}</span>
                  <div className="bar" role="img" aria-label={`${sec.right} из ${sec.total}`}>
                    <i style={{ ['--c' as string]: 'var(--board-2)', width: `${(sec.right / sec.total) * 100}%` }} />
                  </div>
                  <span className="v">
                    {sec.right}/{sec.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {mistakes.length > 0 && (
          <>
            <div className="sec pad">
              <h2 className="kr">해설</h2>
              <span>разбор ошибок · записано в 오답노트</span>
            </div>
            <ul className="notes">
              {mistakes.map((m, k) => (
                <li key={k} className="note-item">
                  <div className="kr" style={{ fontSize: 16 }}>
                    {m.item.audio ? `▶ ${m.item.audio}` : <Rich text={m.item.prompt} />}
                  </div>
                  <div style={{ fontSize: 14 }}>
                    <span className="wrong">{m.wrong}</span> → <span className="right">{m.item.options[m.item.answer]}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                    <Rich text={m.item.why} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="lfoot pad" style={{ display: 'grid', gap: 8 }}>
          {!attempt.passed && (
            <button className="cta" onClick={() => setPhase({ kind: 'drill', ids: attempt.wrongNoteIds })}>
              보충수업 · отработать {attempt.wrongNoteIds.length}
            </button>
          )}
          <button className="cta" style={attempt.passed ? undefined : { background: 'var(--board-2)' }} onClick={() => nav('/', { state: { fresh: attempt.passed } })}>
            В кампус
          </button>
        </div>
      </div>
    );
  }

  // intro
  const preview = exam.make(seedFor(exam.id, attempts.length));
  const leftIds = last && !last.passed ? last.wrongNoteIds.filter((nid) => s.notes[nid] && !(s.notes[nid].lastAnsweredAt && s.notes[nid].lastAnsweredAt! > last.at)) : [];
  return (
    <div className="app">
      <header className="lhead pad">
        <button className="iconbtn" aria-label="Назад" onClick={() => nav(-1)}>
          <svg viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="t">
          <small>{GRADES[exam.grade].name} · переводной экзамен</small>
          <b className="kr">{exam.titleKr}</b>
        </div>
      </header>
      <section className="board">
        <h2>{exam.title}</h2>
        <p className="sub">Как на настоящем экзамене: подсказок нет, время идёт, вернуться к заданию нельзя.</p>
        <div className="chalk">
          {preview.map((sec, k) => (
            <span className="cl" key={sec.key} style={{ ['--i' as string]: k }}>
              <span className="r-kr">{sec.kr}</span> · {sec.ru} — {sec.questions.length} заданий
            </span>
          ))}
          <span className="cl" style={{ ['--i' as string]: 3 }}>
            Время: {exam.minutes} мин · зачёт от {Math.round(exam.pass * 100)}%
          </span>
          <span className="cl" style={{ ['--i' as string]: 4 }}>
            Аудио можно прослушать {exam.plays} раза
          </span>
        </div>
        <p className="note">Каждая попытка — новый вариант. При сдаче вы переходите в {GRADES[exam.grade + 1]?.name ?? 'следующий класс'}.</p>
      </section>
      {attempts.length > 0 && (
        <div className="sheetbox" style={{ backgroundImage: 'none' }}>
          <h4>Попытки</h4>
          {attempts.map((a, k) => (
            <div key={a.at} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>
                {k + 1}. {new Date(a.at).toLocaleDateString('ru-RU')}
              </span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {a.correct}/{a.total} · <b style={{ color: a.passed ? 'var(--ok)' : 'var(--redpen)' }}>{a.passed ? '합격' : '불합격'}</b>
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="lfoot pad" style={{ display: 'grid', gap: 8 }}>
        {!retake.ok && (
          <button className="cta" onClick={() => setPhase({ kind: 'drill', ids: leftIds })}>
            보충수업 · осталось отработать {retake.left}
          </button>
        )}
        <button
          className="cta"
          style={!retake.ok ? { background: 'var(--board-2)' } : undefined}
          disabled={!retake.ok}
          onClick={() => {
            const seed = seedFor(exam.id, attempts.length);
            if (s.bell) bell();
            setPhase({ kind: 'run', seed, sections: exam.make(seed), endAt: Date.now() + exam.minutes * 60000 });
          }}
        >
          {attempts.length ? (passedBefore ? 'Сдать ещё раз' : 'Пересдать · новый вариант') : 'Начать экзамен'}
        </button>
        {!retake.ok && <p className="hint">Пересдача откроется после 보충수업</p>}
      </div>
    </div>
  );
}

function sectionName(key: string) {
  return { listen: '듣기', read: '읽기', write: '쓰기' }[key] ?? key;
}

function ExamRun({ sections, endAt, plays, title, onSubmit }: { sections: ExamSection[]; endAt: number; plays: number; title: string; onSubmit(a: Answer[][]): void }) {
  const flat = useMemo(() => sections.flatMap((sec, si) => sec.questions.map((q, qi) => ({ sec, si, qi, q }))), [sections]);
  const total = questionCount(sections);
  const [k, setK] = useState(0);
  const [answers, setAnswers] = useState<Answer[][]>(() => sections.map((sec) => sec.questions.map(() => null)));
  const [played, setPlayed] = useState<Record<number, number>>({});
  const [left, setLeft] = useState(endAt - Date.now());
  const submitted = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submit = () => {
    if (submitted.current) return;
    submitted.current = true;
    onSubmit(answersRef.current);
  };

  useEffect(() => {
    const t = setInterval(() => {
      const l = endAt - Date.now();
      setLeft(l);
      if (l <= 0) submit();
    }, 500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);

  const cur = flat[k];
  const a = answers[cur.si][cur.qi];
  const set = (v: Answer) => setAnswers((all) => all.map((row, si) => (si === cur.si ? row.map((x, qi) => (qi === cur.qi ? v : x)) : row)));
  const audio = cur.q.kind === 'choice' ? cur.q.item.audio : cur.q.item.audio;
  const usedPlays = played[k] ?? 0;
  const mm = Math.max(0, Math.floor(left / 60000));
  const ss = Math.max(0, Math.floor((left % 60000) / 1000));
  const newSection = k === 0 || flat[k - 1].si !== cur.si;

  return (
    <div className="app">
      <header className="lhead pad">
        <div className="t">
          <small>{title}</small>
          <b>
            <span className="kr">{cur.sec.kr}</span> · {cur.sec.ru}
          </b>
        </div>
        <span className="chip" style={left < 120000 ? { borderColor: 'var(--redpen)', color: 'var(--redpen)' } : undefined} aria-live="off">
          ⏱ <b style={{ color: 'inherit' }}>{`${mm}:${String(ss).padStart(2, '0')}`}</b>
        </span>
      </header>
      <div className="dots pad" aria-label={`Задание ${k + 1} из ${total}`}>
        {flat.map((f, j) => (
          <i key={j} className={j < k ? 'on' : j === k ? 'cur' : ''} style={j > 0 && flat[j - 1].si !== f.si ? { marginLeft: 6 } : undefined} />
        ))}
      </div>
      <div className="sheetbox exam-sheet" style={{ marginTop: 0 }}>
        <div className="count">
          {newSection ? `Раздел ${cur.si + 1}. ` : ''}Задание {k + 1} из {total}
        </div>
        {audio && (
          <button
            className="play"
            disabled={usedPlays >= plays}
            onClick={() => {
              speak(audio);
              setPlayed((p) => ({ ...p, [k]: usedPlays + 1 }));
            }}
          >
            ▶ Слушать · осталось {plays - usedPlays}
          </button>
        )}
        <Question q={cur.q} answer={a} onAnswer={set} />
      </div>
      <div className="lfoot pad">
        <button
          className="cta"
          onClick={() => {
            if (k === flat.length - 1) submit();
            else {
              setK(k + 1);
              window.scrollTo(0, 0);
            }
          }}
        >
          {k === flat.length - 1 ? 'Сдать работу' : a === null || (Array.isArray(a) && !a.length) ? 'Пропустить' : 'Следующее задание'}
        </button>
      </div>
    </div>
  );
}

function Question({ q, answer, onAnswer }: { q: ExamQuestion; answer: Answer; onAnswer(a: Answer): void }) {
  if (q.kind === 'choice') {
    const it = q.item;
    return (
      <>
        {it.prompt !== '___' && (
          <p className={`q${/^[\p{Script=Hangul}\s]+$/u.test(it.prompt) ? '' : ' text'}`}>
            <Rich text={it.prompt} />
            {it.ru && <span className="ru">{it.ru}</span>}
          </p>
        )}
        {it.prompt === '___' && <p className="q text">Что прозвучало?</p>}
        <div className="opts omr">
          {it.options.map((o, j) => (
            <button key={o} className={`opt wide${answer === j ? ' marked' : ''}`} aria-pressed={answer === j} onClick={() => onAnswer(j)}>
              <span className="num">{NUM[j]}</span> <span className={/[\p{Script=Hangul}]/u.test(o) ? 'kr' : ''}>{o}</span>
            </button>
          ))}
        </div>
      </>
    );
  }
  const it = q.item;
  const chosen = Array.isArray(answer) ? answer : [];
  return (
    <>
      <p className="q text">Запишите услышанное слово из слогов{it.ru ? '' : ''}.</p>
      <div className="target" aria-label="Ваш ответ">
        {chosen.map((w, j) => (
          <button key={j} className="tile" onClick={() => onAnswer(chosen.filter((_, x) => x !== j))}>
            {w}
          </button>
        ))}
      </div>
      <div className="pool">
        {it.pool.map((w) => (
          <button key={w} className="tile" onClick={() => onAnswer([...chosen, w])}>
            {w}
          </button>
        ))}
      </div>
    </>
  );
}
