// Мини-разметка контента: [[класс|текст]]. Негативный просмотр вперёд позволяет писать скобки внутри: [[b|[부억]]].
export const RICH_RE = /\[\[(\w+)\|(.+?)\]\](?!\])/g;

export function plain(text: string): string {
  return text.replace(RICH_RE, '$2');
}
