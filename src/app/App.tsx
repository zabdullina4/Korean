import { HashRouter, MemoryRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Toast } from '../components/toast';
import { CampusScreen } from '../features/campus/CampusScreen';
import { GradeScreen } from '../features/campus/GradeScreen';
import { Welcome } from '../features/campus/Welcome';
import { ExamScreen } from '../features/exam/ExamScreen';
import { ReviewScreen } from '../features/cards/ReviewScreen';
import { LessonPlayer } from '../features/lesson/LessonPlayer';
import { NotebookScreen } from '../features/notebook/NotebookScreen';
import { Soon } from '../features/placeholder/Soon';
import { useSchool } from '../state/store';

// В опубликованном артефакте адрес страницы не принимает #/путь, поэтому там маршруты живут в памяти.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : HashRouter;

export function App() {
  const enrolled = useSchool((s) => s.enrolled);
  return (
    <Router>
      {enrolled ? (
        <Routes>
          <Route path="/" element={<CampusScreen />} />
          <Route path="/grade/:n" element={<GradeScreen />} />
          <Route path="/lesson/:id" element={<LessonRoute />} />
          <Route path="/exam/:id" element={<ExamRoute />} />
          <Route path="/cards" element={<ReviewScreen />} />
          <Route path="/notebook" element={<NotebookScreen />} />
          <Route
            path="/dictionary"
            element={<Soon kr="사전" title="Словарь с морфологическим разбором" text="Поиск любой словоформы с разбором на основу и окончания: 먹었으니까 → 먹다 + -었- + -으니까. Следующий этап разработки." />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Welcome />
      )}
      <Toast />
    </Router>
  );
}

// key по id: при переходе с урока на урок состояние проигрывателя начинается заново.
function LessonRoute() {
  const { id } = useParams();
  return <LessonPlayer key={id} />;
}

function ExamRoute() {
  const { id } = useParams();
  return <ExamScreen key={id} />;
}
