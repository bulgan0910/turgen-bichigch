export type AvatarType = 'car' | 'rocket' | 'horse';
export type GameState = 'START' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED';
export type DifficultyType = 'easy' | 'medium' | 'hard' | 'all';
export type LanguageType = 'mn' | 'en';

export interface Sentence {
  id: string;
  text: string;
  author?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'mn' | 'en';
}

export interface ScoreEntry {
  id?: string;
  name: string;
  wpm: number;
  errorCount: number;
  createdAt: any;
  avatar: AvatarType;
  language?: 'mn' | 'en';
}

