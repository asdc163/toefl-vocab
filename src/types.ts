/* The seven curated topical units, plus the ten frequency tiers that the
   14,131-word dictionary is split into (see data/vocabularyLoader.ts). */
export type TOEFLCategory =
  | `tier-${number}`
  | 'academic'
  | 'biology'
  | 'environment'
  | 'humanities'
  | 'psychology'
  | 'astronomy'
  | 'campus';

export interface TOEFLWord {
  id: string;
  word: string;
  phonetic: string;
  pos: 'n.' | 'v.' | 'adj.' | 'adv.' | 'phrase';
  definition: string; // Traditional Chinese
  englishDefinition: string;
  rootEtymology?: string; // e.g. "photo- (光) + synthesis (合成)"
  rootTag?: string; // Root tag e.g. "hypo-", "syn-", "spect-", "geo-", "scrib-" for root network grouping
  wordFamily?: {
    noun?: string;
    verb?: string;
    adj?: string;
    adv?: string;
  };
  collocations?: string[]; // 學術常見搭配詞
  mnemonic: string; // 諧音/聯想/記憶法
  exampleSentence: string;
  translation: string;
  category: TOEFLCategory;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  synonyms: string[];
  antonyms?: string[];
  toeflTopic?: string; // e.g. "Reading - Biology Section"

  /* --- present on dictionary-sourced words (ECDICT), absent on curated ones --- */
  inflections?: { k: string; w: string }[]; // 過去式 / 複數 / 現在分詞 …
  examTags?: string[];                      // toefl / gre / ielts / cet6 / cet4
  tier?: number;                            // 1 (most frequent) … 10
  collins?: number;                         // Collins commonness 1-5
  oxfordCore?: boolean;                     // in the Oxford 3000
}

export interface UserWordProgress {
  wordId: string;
  srsStage: number; // 0 (New) -> 1 (1d) -> 2 (3d) -> 3 (7d) -> 4 (14d) -> 5 (Mastered 30d)
  nextReviewDate: number; // timestamp
  lastReviewedDate?: number; // timestamp
  correctCount: number;
  wrongCount: number;
  history: ('correct' | 'wrong')[];
}

export interface UserProfile {
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  gems: number;
  heartCount: number;
  maxHearts: number;
  dailyGoal: number; // e.g. 15 words
  dailyCompleted: number;
  masteredCount: number;
  unlockedUnits: string[];
  badges: string[];
}

export interface QuizItem {
  id: string;
  wordId: string;
  type: 'multiple-choice-cn' | 'multiple-choice-en' | 'fill-blank' | 'match' | 'listening-spelling';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  sentenceWithBlank?: string;
  targetWord: string;
}

export interface ReadingPassageData {
  id: string;
  title: string;
  topic: string;
  category: TOEFLCategory;
  content: string;
  targetWords: string[];
  questions: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredXp?: number;
  requiredStreak?: number;
  requiredWords?: number;
  unlocked: boolean;
}
