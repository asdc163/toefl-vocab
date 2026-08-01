import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { SkillTree } from './components/SkillTree';
import { WordFamilyExplorer } from './components/WordFamilyExplorer';
import { SRSReviewDeck } from './components/SRSReviewDeck';
import { TOEFLReadingPassageView } from './components/TOEFLReadingPassageView';
import { VocabularyDiagnosticTest } from './components/VocabularyDiagnosticTest';
import { WordDetailModal } from './components/WordDetailModal';
import { DuolingoQuizModal } from './components/DuolingoQuizModal';
import { StatsAndBadges } from './components/StatsAndBadges';
import { MemoryScienceGuideModal } from './components/MemoryScienceGuideModal';

import { TOEFL_VOCABULARY } from './data/toeflVocabulary';
import { loadManifest, loadTiers, type VocabManifest } from './data/vocabularyLoader';
import { TOEFLWord, UserWordProgress, UserProfile } from './types';
import {
  loadUserProgress,
  saveUserProgress,
  loadUserProfile,
  saveUserProfile,
  getDueReviewWords
} from './utils/srsEngine';
import { soundFx } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('learn');
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile());
  const [progressMap, setProgressMap] = useState<Record<string, UserWordProgress>>(loadUserProgress());
  const [wordsList, setWordsList] = useState<TOEFLWord[]>(TOEFL_VOCABULARY);
  const [manifest, setManifest] = useState<VocabManifest | null>(null);
  const [dictError, setDictError] = useState<string | null>(null);

  /* Pull in the shipped dictionary. The 33 curated cards render immediately;
     the frequency tiers stream in behind them so the first paint is not
     blocked on 4 MB of JSON. Tiers 1-3 cover the highest-value words, so they
     load up front and the rest follow. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mf = await loadManifest();
        if (cancelled) return;
        setManifest(mf);

        const merge = (incoming: TOEFLWord[]) =>
          setWordsList(prev => {
            const seen = new Set(prev.map(w => w.word.toLowerCase()));
            return [...prev, ...incoming.filter(w => !seen.has(w.word.toLowerCase()))];
          });

        merge(await loadTiers([1, 2, 3]));
        if (cancelled) return;
        merge(await loadTiers([4, 5, 6, 7, 8, 9, 10]));
      } catch (err) {
        if (!cancelled) {
          setDictError('詞庫載入失敗，目前只顯示內建精選字卡。請檢查網路後重新整理。');
          console.error(err);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Modals state
  const [activeQuizCategory, setActiveQuizCategory] = useState<string | undefined>(undefined);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [inspectedWord, setInspectedWord] = useState<TOEFLWord | null>(null);
  const [showMemoryGuide, setShowMemoryGuide] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync state to local storage
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveUserProgress(progressMap);
  }, [progressMap]);

  // Handle adding new word dynamically from AI expansion
  const handleAddCustomWord = (word: TOEFLWord) => {
    setWordsList(prev => {
      if (prev.some(w => w.id === word.id || w.word.toLowerCase() === word.word.toLowerCase())) {
        return prev;
      }
      return [word, ...prev];
    });

    // Initialize SRS progress for new word
    if (!progressMap[word.id]) {
      setProgressMap(prev => ({
        ...prev,
        [word.id]: {
          wordId: word.id,
          srsStage: 0,
          nextReviewDate: Date.now(),
          correctCount: 0,
          wrongCount: 0,
          history: []
        }
      }));
    }
  };

  // Calculate due words for SRS review
  const dueWords = getDueReviewWords(wordsList, progressMap);

  const handleStartQuiz = (category?: string) => {
    setActiveQuizCategory(category);
    setShowQuizModal(true);
  };

  const handleEarnXp = (xp: number) => {
    setProfile(prev => {
      const newXp = prev.xp + xp;
      const newGems = prev.gems + Math.floor(xp / 10);
      const newCompleted = prev.dailyCompleted + 1;
      return {
        ...prev,
        xp: newXp,
        gems: newGems,
        dailyCompleted: newCompleted
      };
    });
  };

  const handleFinishQuiz = (earnedXp: number, correctWordIds: string[]) => {
    setShowQuizModal(false);
    handleEarnXp(earnedXp);

    // Update progress map for correct words
    const updated = { ...progressMap };
    correctWordIds.forEach(id => {
      const current = updated[id] || {
        wordId: id,
        srsStage: 0,
        nextReviewDate: Date.now(),
        correctCount: 0,
        wrongCount: 0,
        history: []
      };
      updated[id] = {
        ...current,
        srsStage: Math.min(5, current.srsStage + 1),
        nextReviewDate: Date.now() + 86400000,
        correctCount: current.correctCount + 1,
        history: [...(current.history || []).slice(-9), 'correct']
      };
    });
    setProgressMap(updated);
  };

  const handleUpdateSrsProgress = (newMap: Record<string, UserWordProgress>, xpGained: number) => {
    setProgressMap(newMap);
    handleEarnXp(xpGained);
  };

  const handleToggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Status Bar & Header */}
      <Header
        profile={profile}
        onOpenMemoryGuide={() => setShowMemoryGuide(true)}
        onToggleSound={handleToggleSound}
        soundEnabled={soundEnabled}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-3">
        {activeTab === 'learn' && (
          <SkillTree
            words={wordsList}
            profile={profile}
            progressMap={progressMap}
            onStartQuiz={handleStartQuiz}
            onOpenWordDetail={(w) => setInspectedWord(w)}
          />
        )}

        {activeTab === 'family' && (
          <WordFamilyExplorer
            allWords={wordsList}
            onAddWord={handleAddCustomWord}
            onOpenWordDetail={(w) => setInspectedWord(w)}
          />
        )}

        {activeTab === 'srs' && (
          <SRSReviewDeck
            dueWords={dueWords}
            allWords={wordsList}
            progressMap={progressMap}
            profile={profile}
            onUpdateProgress={handleUpdateSrsProgress}
            onOpenWordDetail={(w) => setInspectedWord(w)}
          />
        )}

        {activeTab === 'reading' && (
          <TOEFLReadingPassageView
            allWords={wordsList}
            onOpenWordDetail={(w) => setInspectedWord(w)}
            onEarnXp={handleEarnXp}
          />
        )}

        {activeTab === 'diagnostic' && (
          <VocabularyDiagnosticTest
            allWords={wordsList}
            onEarnXp={handleEarnXp}
          />
        )}

        {activeTab === 'stats' && (
          <StatsAndBadges
            profile={profile}
            progressMap={progressMap}
            allWords={wordsList}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          soundFx.playClick();
          setActiveTab(tab);
        }}
        dueCount={dueWords.length}
      />

      {/* Interactive Modals */}
      {showQuizModal && (
        <DuolingoQuizModal
          category={activeQuizCategory}
          allWords={wordsList}
          progressMap={progressMap}
          onClose={() => setShowQuizModal(false)}
          onFinishQuiz={handleFinishQuiz}
        />
      )}

      {inspectedWord && (
        <WordDetailModal
          word={inspectedWord}
          progress={progressMap[inspectedWord.id]}
          onClose={() => setInspectedWord(null)}
        />
      )}

      {showMemoryGuide && (
        <MemoryScienceGuideModal
          onClose={() => setShowMemoryGuide(false)}
        />
      )}

    </div>
  );
}
