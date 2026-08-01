import { UserWordProgress, UserProfile, TOEFLWord } from '../types';

/* Local calendar day as YYYY-MM-DD.
   toISOString() converts to UTC first, so east of Greenwich it returns
   yesterday for the first hours of every day — which silently resets streaks.
   Everything date-related here must go through these two helpers. */
const pad = (n: number) => String(n).padStart(2, '0');
export function localDay(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function daysBetween(a: string, b: string): number {
  const p = (s: string) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((p(b) - p(a)) / 86400000);
}

const STORAGE_KEY_PROGRESS = 'toefl_vocab_user_progress_v1';
const STORAGE_KEY_PROFILE = 'toefl_vocab_user_profile_v1';

// Interval days corresponding to SRS stage 0..5
export const SRS_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];

export const INITIAL_PROFILE: UserProfile = {
  xp: 120,
  streakDays: 1,
  lastActiveDate: localDay(),
  gems: 45,
  heartCount: 5,
  maxHearts: 5,
  dailyGoal: 10,
  dailyCompleted: 0,
  masteredCount: 0,
  unlockedUnits: ['academic', 'biology', 'environment'],
  badges: ['b1']
};

export function loadUserProgress(): Record<string, UserWordProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user progress:', e);
  }
  return {};
}

export function saveUserProgress(progress: Record<string, UserWordProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save user progress:', e);
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Check streak day reset
      const today = localDay();
      if (parsed.lastActiveDate !== today) {
        const gap = daysBetween(parsed.lastActiveDate, today);
        if (gap === 1) {
          // Studied yesterday — streak continues
        } else if (gap > 1) {
          // Missed at least one day
          parsed.streakDays = 1;
        }
        parsed.lastActiveDate = today;
        parsed.dailyCompleted = 0; // Reset daily count
        // Auto recover 1 heart per day
        parsed.heartCount = Math.min(parsed.maxHearts, parsed.heartCount + 2);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load user profile:', e);
  }
  return INITIAL_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

// Calculate due review items
export function getDueReviewWords(
  allWords: TOEFLWord[],
  progressMap: Record<string, UserWordProgress>
): { word: TOEFLWord; progress: UserWordProgress }[] {
  const now = Date.now();
  const dueList: { word: TOEFLWord; progress: UserWordProgress }[] = [];

  allWords.forEach((word) => {
    const prog = progressMap[word.id];
    if (prog) {
      if (prog.nextReviewDate <= now && prog.srsStage < 5) {
        dueList.push({ word, progress: prog });
      }
    }
  });

  return dueList;
}

// Record review answer (Easy, Good, Hard, Again)
export function updateWordSrsStatus(
  wordId: string,
  quality: 'easy' | 'good' | 'hard' | 'again',
  progressMap: Record<string, UserWordProgress>
): { newProgress: UserWordProgress; updatedMap: Record<string, UserWordProgress> } {
  const current = progressMap[wordId] || {
    wordId,
    srsStage: 0,
    nextReviewDate: Date.now(),
    correctCount: 0,
    wrongCount: 0,
    history: []
  };

  let nextStage = current.srsStage;

  switch (quality) {
    case 'easy':
      nextStage = Math.min(5, current.srsStage + 2);
      break;
    case 'good':
      nextStage = Math.min(5, current.srsStage + 1);
      break;
    case 'hard':
      nextStage = Math.max(1, current.srsStage);
      break;
    case 'again':
      nextStage = 1; // Reset to level 1 for active recall
      break;
  }

  const intervalDays = SRS_INTERVAL_DAYS[nextStage] || 1;
  // If "again", review in 10 minutes (600,000 ms), else intervalDays * 86400000
  const reviewDelayMs = quality === 'again' ? 600000 : intervalDays * 86400000;
  const nextReviewDate = Date.now() + reviewDelayMs;

  const isCorrect = quality === 'easy' || quality === 'good';

  const newProgress: UserWordProgress = {
    ...current,
    srsStage: nextStage,
    nextReviewDate,
    lastReviewedDate: Date.now(),
    correctCount: current.correctCount + (isCorrect ? 1 : 0),
    wrongCount: current.wrongCount + (!isCorrect ? 1 : 0),
    history: [...(current.history || []).slice(-9), isCorrect ? 'correct' : 'wrong']
  };

  const updatedMap = {
    ...progressMap,
    [wordId]: newProgress
  };

  saveUserProgress(updatedMap);
  return { newProgress, updatedMap };
}
