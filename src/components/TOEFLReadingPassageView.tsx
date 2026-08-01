import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, HelpCircle, Volume2, RefreshCw, Layers } from 'lucide-react';
import { ReadingPassageData, TOEFLWord } from '../types';
import { TOEFL_READING_PASSAGES } from '../data/toeflVocabulary';
import { soundFx } from '../utils/sound';

interface TOEFLReadingPassageViewProps {
  allWords: TOEFLWord[];
  onOpenWordDetail: (word: TOEFLWord) => void;
  onEarnXp: (xp: number) => void;
}

export const TOEFLReadingPassageView: React.FC<TOEFLReadingPassageViewProps> = ({
  allWords,
  onOpenWordDetail,
  onEarnXp
}) => {
  const [currentPassage, setCurrentPassage] = useState<ReadingPassageData>(TOEFL_READING_PASSAGES[0]);
  const [selectedWord, setSelectedWord] = useState<TOEFLWord | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Generate new AI passage via server
  const handleGenerateAiPassage = async () => {
    setIsAiGenerating(true);
    setShowResults(false);
    setSelectedAnswers({});
    try {
      // Pick 3 random words
      const targetList = [...allWords].sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.word);

      const res = await fetch('/api/ai/reading-passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: targetList,
          topic: 'Academic Biology and Environmental Ecology'
        })
      });
      const data = await res.json();
      if (data.success && data.passageData) {
        setCurrentPassage({
          id: `ai_${Date.now()}`,
          title: data.passageData.title,
          topic: data.passageData.topic,
          category: 'biology',
          content: data.passageData.passage,
          targetWords: data.passageData.targetWords || targetList,
          questions: data.passageData.questions
        });
        soundFx.playCorrect();
      }
    } catch (err) {
      console.error('Failed to generate AI passage:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    soundFx.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    let correct = 0;
    currentPassage.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) correct++;
    });

    if (correct > 0) {
      soundFx.playCorrect();
      onEarnXp(correct * 20);
    } else {
      soundFx.playWrong();
    }
  };

  // Render passage content with highlighted interactive word tokens
  const renderPassageWithHighlights = () => {
    const text = currentPassage.content;
    const wordsToHighlight = currentPassage.targetWords;

    // Create regex matching target words
    const regex = new RegExp(`\\b(${wordsToHighlight.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return (
      <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-serif tracking-wide">
        {parts.map((part, index) => {
          const matchedWord = allWords.find(w => w.word.toLowerCase() === part.toLowerCase());

          if (matchedWord) {
            return (
              <span
                key={index}
                onClick={() => {
                  soundFx.speak(matchedWord.word);
                  setSelectedWord(matchedWord);
                }}
                className="bg-emerald-100 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded-md cursor-pointer border-b-2 border-emerald-500 hover:bg-amber-200 hover:text-amber-950 transition-all inline-block mx-0.5"
                title="點擊聽發音與查看單字卡"
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 pt-2">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
        {/* Title and generate button sit side by side when there is room and
            stack on a narrow phone. Without flex-wrap the button forced the
            row past the viewport at 320px. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              托福 iBT 真題閱讀情境
            </span>
            <h2 className="text-xl font-extrabold text-slate-800 mt-1 break-words">{currentPassage.title}</h2>
            <p className="text-xs text-slate-500 break-words">{currentPassage.topic}</p>
          </div>

          {/* AI Generator Button */}
          <button
            onClick={handleGenerateAiPassage}
            disabled={isAiGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black px-3.5 rounded-2xl shadow-md text-xs transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {isAiGenerating ? 'AI 生成托福文章中...' : '生成 AI 真題閱讀'}
          </button>
        </div>
      </div>

      {/* Reading Article Box */}
      <div className="bg-amber-50/40 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-sm space-y-4 relative">
        <div className="text-xs font-bold text-amber-800 flex items-center justify-between border-b border-amber-200/60 pb-2">
          <span>📖 學術閱讀內文 (點擊螢光標記單字查看釋義與聽音)</span>
          <span>高頻詞彙: {currentPassage.targetWords.length} 個</span>
        </div>

        {renderPassageWithHighlights()}
      </div>

      {/* Interactive Word Inspector Card (if clicked) */}
      {selectedWord && (
        <div className="bg-white rounded-2xl border-2 border-emerald-400 p-4 shadow-lg animate-fade-in flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900">{selectedWord.word}</span>
              <span className="text-xs font-bold text-emerald-600">{selectedWord.pos}</span>
              <button
                onClick={() => soundFx.speak(selectedWord.word)}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedWord.definition}</div>
            <div className="text-xs text-slate-500 italic">{selectedWord.exampleSentence}</div>
          </div>

          <button
            onClick={() => onOpenWordDetail(selectedWord)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs shrink-0"
          >
            查看詳細
          </button>
        </div>
      )}

      {/* Comprehension Questions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          托福閱讀理解特訓測驗
        </h3>

        <div className="space-y-6">
          {currentPassage.questions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-3 pb-4 border-b border-slate-100 last:border-b-0">
              <div className="font-bold text-slate-800 text-sm">
                Q{qIdx + 1}. {q.question}
              </div>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  let optStyle = 'border-slate-200 bg-white hover:bg-slate-50';

                  if (showResults) {
                    if (oIdx === q.answerIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected && oIdx !== q.answerIndex) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-bold';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(qIdx, oIdx)}
                      disabled={showResults}
                      className={`w-full text-left p-3 rounded-2xl border text-xs font-medium transition-all ${optStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 border border-slate-200">
                  <span className="font-bold text-emerald-700">【解析】</span> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {!showResults ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length < currentPassage.questions.length}
            className={`w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all ${
              Object.keys(selectedAnswers).length >= currentPassage.questions.length
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            提交測驗答案
          </button>
        ) : (
          <button
            onClick={() => {
              setShowResults(false);
              setSelectedAnswers({});
            }}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs"
          >
            重做一次本篇測驗
          </button>
        )}
      </div>
    </div>
  );
};
