import { NavLink } from 'react-router-dom';
import { isOpen } from '../lib/notebook';
import { reviewQueue } from '../lib/plan';
import { useSchool } from '../state/store';

export function TabBar() {
  const s = useSchool();
  const due = reviewQueue(s).all.length;
  const open = Object.values(s.notes).filter(isOpen).length;
  const tabs = [
    { to: '/', k: '학교', ru: 'Школа', end: true },
    { to: '/cards', k: '단어장', ru: 'Карточки', n: due },
    { to: '/dictionary', k: '사전', ru: 'Словарь' },
    { to: '/notebook', k: '오답노트', ru: 'Ошибки', n: open },
  ];
  return (
    <nav className="tabs" aria-label="Разделы">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="tab" style={{ textDecoration: 'none' }}>
          <span className="k">
            {t.k}
            {t.n ? <span className="n">{t.n}</span> : null}
          </span>
          {t.ru}
        </NavLink>
      ))}
    </nav>
  );
}
