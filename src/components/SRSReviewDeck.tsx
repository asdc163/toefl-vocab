import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, RotateCw, CheckCircle, AlertCircle, Brain, ArrowRight, Lightbulb, Zap, HelpCircle } from 'lucide-react';
import { TOEFLWord, UserWordProgress, UserProfile } from '../types';
import { soundFx } from '../utils/sound';
import { updateWordSrsStatus, SRS_INTERVAL_DAYS } from '../utils/srsEngine';

interface SRSReviewDeckProps {
  dueWords: { word: TOEFLWord; progress: UserWordProgress }[];
  allWords: TOEFLWord[];
  progressMap: Record<string, UserWordProgress>;
  profile: UserProfile;
  onUpdateProgress: (newMap: Record<string, UserWordProgress>, xpGained: number) => void;
  onOpenWordDetail: (word: TOEFLWord) => void;
}

export const SRSReviewDeck: React.FC<SRSReviewDeckProps> = ({
  dueWords,
  allWords,
  progressMap,
  profile,
  onUpdateProgress,
  onOpenWordDetail
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewItems, setReviewItems] = useState<{ word: TOEFLWord; progress: UserWordProgress }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customAiMnemonic, setCustomAiMnemonic] = useState<string | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);

  useEffect(() => {
    // If no due words, load a review batch of 10 least reviewed or level 1-3 words
    if (dueWords.length > 0) {
      setReviewItems(dueWords);
    } else {
      // Pick up to 8 words for review practice
      const practiceList = allWords
        .map(w => ({
          word: w,
          progress: progressMap[w.id] || {
            wordId: w.id,
            srsStage: 0,
            nextReviewDate: Date.now(),
            correctCount: 0,
            wrongCount: 0,
            history: []
          }
        }))
        .slice(0, 8);
      setReviewItems(practiceList);
    }
  }, [dueWords, allWords, progressMap]);

  const currentItem = reviewItems[currentIndex];

  const handleFlipCard = () => {
    soundFx.playClick();
    setIsFlipped(!isFlipped);
    if (!isFlipped && currentItem) {
      soundFx.speak(currentItem.word.word);
    }
  };

  const handleAnswer = (quality: 'easy' | 'good' | 'hard' | 'again') => {
    if (!currentItem) return;

    if (quality === 'easy' || quality === 'good') {
      soundFx.playCorrect();
    } else {
      soundFx.playWrong();
    }

    const xpEarned = quality === 'easy' ? 15 : quality === 'good' ? 10 : 5;
    const { updatedMap } = updateWordSrsStatus(currentItem.word.id, quality, progressMap);

    setSessionXp(prev => prev + xpEarned);
    onUpdateProgress(updatedMap, xpEarned);

    // Reset card state and advance
    setIsFlipped(false);
    setCustomAiMnemonic(null);

    if (currentIndex + 1 < reviewItems.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      soundFx.playLevelUp();
      setSessionCompleted(true);
    }
  };

  // Generate AI Mnemonic via Express Gemini route
  const handleGenerateAiMnemonic = async () => {
    if (!currentItem) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/mnemonic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: currentItem.word.word,
          definition: currentItem.word.definition,
          pos: currentItem.word.pos
        })
      });
      const data = await res.json();
      if (data.mnemonicStory) {
        setCustomAiMnemonic(`${data.rootBreakdown ? `[字根] ${data.rootBreakdown}\n` : ''}${data.mnemonicStory}`);
      }
    } catch (err) {
      console.error('AI Mnemonic error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Leitner 5-box stats calculation
  const getBoxStats = () => {
    const boxes = [0, 0, 0, 0, 0, 0];
    allWords.forEach(w => {
      const stage = progressMap[w.id]?.srsStage || 0;
      boxes[stage] = (boxes[stage] || 0) + 1;
    });
    return boxes;
  };

  const boxStats = getBoxStats();

  if (sessionCompleted) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-6 shadow-lg max-w-lg mx-auto my-6 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
          🎉
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">復習特訓完成！</h2>
          <p className="text-sm text-slate-500 mt-1">你成功運用艾賓浩斯記憶法加強了大腦記憶連線！</p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-around text-emerald-900 font-bold">
          <div>
            <div className="text-2xl text-emerald-600">+{sessionXp}</div>
            <div className="text-xs text-slate-500 font-medium">獲得 XP 經驗</div>
          </div>
          <div className="h-8 w-px bg-emerald-200" />
          <div>
            <div className="text-2xl text-teal-600">{reviewItems.length}</div>
            <div className="text-xs text-slate-500 font-medium">復習單字數</div>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setSessionCompleted(false);
            setCurrentIndex(0);
          }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all text-base"
        >
          再進行一輪 SRS 復習
        </button>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="text-center py-12 space-y-4">
        <Brain className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
        <h3 className="font-bold text-slate-700">正在準備你的 SRS 復習卡片...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl mx-auto pb-24 pt-2">
      
      {/* Title & Ebbinghaus SRS Box Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-slate-800 text-base">艾賓浩斯 Leitner 5 盒記憶系統</h2>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
            今日待復習: {dueWords.length} 個
          </span>
        </div>

        {/* 5 Leitner Boxes status visualizer */}
        <div className="grid grid-cols-6 gap-1.5 text-center mt-3">
          {['新字', '1天', '3天', '7天', '14天', '精通'].map((label, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-1.5">
              <div className="text-[10px] text-slate-400 font-medium">{label}</div>
              <div className={`text-xs font-black ${idx === 5 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {boxStats[idx] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SRS Flashcard Progress Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>卡片進度: {currentIndex + 1} / {reviewItems.length}</span>
        <span className="text-emerald-600 font-medium">
          當前單字階段: Level {currentItem.progress.srsStage} (下一次復習: {SRS_INTERVAL_DAYS[currentItem.progress.srsStage]} 天後)
        </span>
      </div>

      {/* 3D Active Recall Flip Card */}
      <div
        onClick={handleFlipCard}
        className="w-full min-h-[320px] sm:min-h-[360px] bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-400 p-6 shadow-md cursor-pointer transition-all duration-300 relative flex flex-col justify-between group select-none hover:shadow-xl"
      >
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-slate-400 font-medium">
          <RotateCw className="w-4 h-4 text-emerald-500 group-hover:rotate-180 transition-transform duration-500" />
          點擊卡片翻面
        </div>

        {!isFlipped ? (
          /* FRONT OF CARD (Active Recall Prompt) */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto py-8">
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              {currentItem.word.categoryName} • {currentItem.word.pos}
            </span>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {currentItem.word.word}
            </h1>

            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.speak(currentItem.word.word);
              }}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 transition-colors"
              title="英式/美式發音"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <p className="text-xs text-slate-400 italic font-mono">
              {currentItem.word.phonetic}
            </p>

            <div className="pt-4 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              💡 請先在腦海中【主動回想】中文意思與例句用法，然後點擊翻面核對答案
            </div>
          </div>
        ) : (
          /* BACK OF CARD (Answer & Science Memory Associations) */
          <div className="flex-1 flex flex-col justify-between space-y-4 py-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-2xl font-black text-slate-900">{currentItem.word.word}</span>
                  <span className="text-sm font-bold text-emerald-600 ml-2">{currentItem.word.pos}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.speak(currentItem.word.word);
                  }}
                  className="p-1.5 bg-emerald-50 rounded-full text-emerald-600"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Chinese Definition */}
              <div className="text-xl font-bold text-slate-800">
                {currentItem.word.definition}
              </div>
              <div className="text-xs text-slate-500">
                {currentItem.word.englishDefinition}
              </div>

              {/* Root Etymology & Mnemonic */}
              {currentItem.word.rootEtymology && (
                <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 border border-slate-200/80">
                  <span className="font-bold text-emerald-700">拆解字根: </span>
                  {currentItem.word.rootEtymology}
                </div>
              )}

              {/* Pre-built Mnemonic or Custom AI Mnemonic */}
              <div className="bg-amber-50/80 p-3 rounded-2xl text-xs text-amber-900 border border-amber-200">
                <div className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1 text-amber-800">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    記憶法 (Mnemonic):
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateAiMnemonic();
                    }}
                    disabled={isAiLoading}
                    className="flex items-center gap-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold px-2 py-0.5 rounded-md text-[10px] transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    {isAiLoading ? 'Gemini 思考中...' : '生成 AI 諧音梗'}
                  </button>
                </div>
                <p className="leading-relaxed whitespace-pre-line">
                  {customAiMnemonic || currentItem.word.mnemonic}
                </p>
              </div>

              {/* Example Sentence */}
              <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/80 space-y-1 text-xs">
                <div className="font-bold text-emerald-800">托福真題學術例句:</div>
                <div className="text-slate-800 font-medium">{currentItem.word.exampleSentence}</div>
                <div className="text-slate-500">{currentItem.word.translation}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Answer Quality Self-Assessment Buttons (Only visible when flipped) */}
      {isFlipped && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-center text-xs font-bold text-slate-500">
            請依據你剛才【主動回想】的熟練度進行評分：
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleAnswer('again')}
              className="bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold py-3 px-2 rounded-2xl text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <span className="text-base">🔴</span>
              <span>完全忘記</span>
              <span className="text-[10px] text-rose-500 font-normal">重新特訓</span>
            </button>

            <button
              onClick={() => handleAnswer('hard')}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold py-3 px-2 rounded-2xl text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <span className="text-base">🟡</span>
              <span>有點模糊</span>
              <span className="text-[10px] text-amber-600 font-normal">保持階段</span>
            </button>

            <button
              onClick={() => handleAnswer('good')}
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold py-3 px-2 rounded-2xl text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <span className="text-base">🟢</span>
              <span>順利想出</span>
              <span className="text-[10px] text-emerald-600 font-normal">+1 階段</span>
            </button>

            <button
              onClick={() => handleAnswer('easy')}
              className="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 font-bold py-3 px-2 rounded-2xl text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <span className="text-base">🔵</span>
              <span>太簡單了</span>
              <span className="text-[10px] text-sky-600 font-normal">+2 跳階</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
