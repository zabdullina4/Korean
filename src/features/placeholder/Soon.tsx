import { TabBar } from '../../components/TabBar';

export function Soon({ kr, title, text }: { kr: string; title: string; text: string }) {
  return (
    <div className="app">
      <div className="page-title pad">
        <h1 className="kr">{kr}</h1>
        <p>{title}</p>
      </div>
      <div className="empty">
        <b>Скоро</b>
        {text}
      </div>
      <TabBar />
    </div>
  );
}
