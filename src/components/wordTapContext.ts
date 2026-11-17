import { createContext } from 'react';

export interface WordTap {
  open(word: string): void;
}

/** Есть только внутри урока: там корейские слова нажимаются и открывают разбор. */
export const WordTapContext = createContext<WordTap | null>(null);
