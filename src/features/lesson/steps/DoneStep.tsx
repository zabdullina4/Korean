import { Rich } from '../../../components/Rich';
import type { Lesson } from '../../../content/types';

export function DoneStep({ lesson, score, errors, preview }: { lesson: Lesson; score: number; errors: number; preview: boolean }) {
  return (
    <>
      <section className="board" style={{ textAlign: 'center' }}>
        <h2>수업 끝!</h2>
        <p className="sub" style={{ margin: 0 }}>
          {preview ? 'Это было превью урока старшего класса — прогресс не сохраняется.' : 'Урок окончен. Учитель ставит печать.'}
        </p>
      </section>
      <div className="sheetbox" style={{ backgroundImage: 'none' }}>
        <div className="stamp">
          참<br />
          잘했어요
          <small>{score} баллов</small>
        </div>
        <div className="sum">
          <div>
            <b>{preview ? 0 : lesson.words.length * 2}</b>
            <span>
              новых карточек
              <br />в 단어장
            </span>
          </div>
          <div>
            <b>{errors}</b>
            <span>
              ошибок
              <br />
              за урок
            </span>
          </div>
          <div>
            <b>{lesson.words.length}</b>
            <span>
              новых
              <br />
              слов
            </span>
          </div>
        </div>
        {lesson.words.length > 0 && (
          <p style={{ fontSize: 14, margin: '14px 0 0' }}>
            {lesson.words.map((w) => (
              <span key={w.id} style={{ marginRight: 12, whiteSpace: 'nowrap' }}>
                <span className="kr" style={{ fontSize: 17 }}>
                  <Rich text={w.kr} />
                </span>{' '}
                <span style={{ color: 'var(--ink-2)' }}>{w.ru}</span>
              </span>
            ))}
          </p>
        )}
        {lesson.outro && (
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '12px 0 0' }}>
            <Rich text={lesson.outro} />
          </p>
        )}
      </div>
    </>
  );
}
