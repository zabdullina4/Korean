import { useSchool } from '../../state/store';

export function Welcome() {
  const enroll = useSchool((s) => s.enroll);
  return (
    <div className="app">
      <div className="welcome pad">
        <div className="chip" style={{ alignSelf: 'flex-start' }}>
          입학식 · зачисление
        </div>
        <h1 className="kr">한국어 학교</h1>
        <p className="lead">Школа корейского языка от алфавита до TOPIK 6급: уроки по расписанию, экзамены, карточки и тетрадь ошибок.</p>
        <button className="choice-card primary" onClick={() => enroll(0)}>
          <b>Начать с нуля · 예비반</b>
          <span>Подготовительный класс: хангыль, звуки, первые слова. 6 уроков по 12–15 минут.</span>
        </button>
        <button className="choice-card" disabled>
          <b>Я уже учу корейский</b>
          <span>Вступительный адаптивный тест определит класс. Появится в следующей версии.</span>
        </button>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>Прогресс хранится в этом браузере.</p>
      </div>
    </div>
  );
}
