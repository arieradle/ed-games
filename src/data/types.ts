export interface Word {
  word: string;
  emoji: string;
  hint: string;
}

export interface Topic {
  label: string;
  he: string;
  words: Word[];
}

export interface LetterEntry {
  upper: string;
  lower: string;
  ex: string;
}

export interface VowelQuestion {
  display: string;
  ans: string;
  full: string;
  emoji: string;
  hint: string;
}

export interface RhymeQuestion {
  anchor: string;
  correct: string;
  distractors: string[];
}

export interface SentenceQuestion {
  words: string[];
  emoji: string;
  hint: string;
}

export interface HistoryEntry {
  question: string;
  userAnswer: number;
  correctAnswer: number;
  correct: boolean;
  difficulty: string;
  time: string;
}
