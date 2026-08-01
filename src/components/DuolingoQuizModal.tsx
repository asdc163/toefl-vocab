import React, { useState, useEffect } from 'react';
import { X, Volume2, CheckCircle2, XCircle, Sparkles, Trophy, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { TOEFLWord, UserWordProgress, QuizItem } from '../types';
import { soundFx } from '../utils/sound';

interface DuolingoQuizModalProps {
  category?: string;
  allWords: TOEFLWord[];
  progressMap: Record<string, UserWordProgress>;
  onClose: () => void;
  onFinishQuiz: (earnedXp: number, correctWordIds: string[]) => void;
}

export const DuolingoQuizModal: React.FC<DuolingoQuizModalProps> = ({
  category,
  allWords,
  progressMap,
  onClose,
  onFinishQuiz
}) => {
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [correctWordIds, setCorrectWordIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Generate quiz items from word pool
  useEffect(() => {
    /* The dictionary spans junior-high through GRE. Drilling "pianist" or
       "prince" in a TOEFL session is a waste of the learner's time, so
       questions are drawn from exam-level words when any are available. */
    const isExamLevel = (w: TOEFLWord) =>
      !w.examTags || w.examTags.some(t => t === 'toefl' || t === 'gre' || t === 'ielts');

    let pool = category ? allWords.filter(w => w.category === category) : allWords;
    const examPool = pool.filter(isExamLevel);
    if (examPool.length >= 4) pool = examPool;
    if (pool.length < 4) pool = allWords;

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);

    const generatedItems: QuizItem[] = shuffled.map((target, idx) => {
      /* Distractors come from the target's own tier so every option sits at a
         comparable difficulty — a rare word next to three easy ones gives the
         answer away. */
      const sameTier = allWords.filter(
        w => w.id !== target.id && isExamLevel(w) && (!target.tier || w.tier === target.tier),
      );
      const distractorPool = sameTier.length >= 3
        ? sameTier
        : allWords.filter(w => w.id !== target.id && isExamLevel(w));

      const distractors = distractorPool
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const typeChoice = idx % 2 === 0 ? 'multiple-choice-cn' : 'fill-blank';

      if (typeChoice === 'fill-blank') {
        const blankedSentence = target.exampleSentence.replace(
          new RegExp(target.word, 'gi'),
          '_______'
        );
        const options = [target.word, ...distractors.map(d => d.word)].sort(() => Math.random() - 0.5);

        return {
          id: `q_${idx}`,
          wordId: target.id,
          type: 'fill-blank',
          prompt: `請選擇最適當的托福高頻單字填入句中空格：`,
          sentenceWithBlank: blankedSentence,
          options,
          correctAnswer: target.word,
          explanation: `【${target.word}】(${target.pos}): ${target.definition}。例句：${target.translation}`,
          targetWord: target.word
        };
      } else {
        const options = [target.definition, ...distractors.map(d => d.definition)].sort(() => Math.random() - 0.5);

        return {
          id: `q_${idx}`,
          wordId: target.id,
          type: 'multiple-choice-cn',
          prompt: `請問「 ${target.word} 」的托福核心中文含義是？`,
          options,
          correctAnswer: target.definition,
          explanation: `【${target.word}】(${target.pos}): ${target.definition}。${target.rootEtymology ? `[字根解析] ${target.rootEtymology}` : ''}`,
          targetWord: target.word
        };
      }
    });

    setQuestions(generatedItems);
  }, [category, allWords]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    soundFx.playClick();
    setSelectedAnswer(opt);
  };

  const handleCheckAnswer = () => {
    if (!currentQ || !selectedAnswer || isAnswerChecked) return;

    const correct = selectedAnswer === currentQ.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      soundFx.playCorrect();
      setCorrectCount(prev => prev + 1);
      setCorrectWordIds(prev => [...prev, currentQ.wordId]);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      soundFx.playLevelUp();
      setIsFinished(true);
    }
  };

  const handleFinishSession = () => {
    const earnedXp = correctCount * 10 + 20;
    onFinishQuiz(earnedXp, correctWordIds);
  };

  if (!currentQ && !isFinished) {
    return null;
  }

  const progressPercent = questions.length > 0 ? Math.round(((currentIndex) / questions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Progress */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            <span>{correctCount * 10} XP</span>
          </div>
        </div>

        {/* Modal Body */}
        {!isFinished ? (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Question Prompt */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  第 {currentIndex + 1} / {questions.length} 題
                </span>
                <button
                  onClick={() => soundFx.speak(currentQ.targetWord)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-700 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-800 leading-snug">
                {currentQ.prompt}
              </h3>

              {currentQ.sentenceWithBlank && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-800 leading-relaxed italic">
                  "{currentQ.sentenceWithBlank}"
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options?.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                let btnStyle = 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/30';

                if (isAnswerChecked) {
                  if (opt === currentQ.correctAnswer) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-bold';
                  } else {
                    btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold shadow-sm scale-[1.01]';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswerChecked}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 flex items-center justify-between text-sm ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerChecked && opt === currentQ.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation Box */}
            {isAnswerChecked && (
              <div className={`p-4 rounded-2xl text-xs space-y-1 animate-fade-in border ${
                isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  {isCorrect ? '答對了！大腦成功強化連結！' : '別灰心，錯題會自動加入 SRS 復習盒！'}
                </div>
                <div className="leading-relaxed font-medium">{currentQ.explanation}</div>
              </div>
            )}
          </div>
        ) : (
          /* Completion Screen */
          <div className="p-8 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl shadow-inner">
              🏆
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">特訓關卡完成！</h2>
              <p className="text-sm text-slate-500 mt-1">答對率：{correctCount} / {questions.length} 題</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full flex justify-around text-amber-900 font-bold">
              <div>
                <div className="text-2xl text-amber-600">+{correctCount * 10 + 20}</div>
                <div className="text-xs text-slate-500 font-medium">經驗獎勵 XP</div>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div>
                <div className="text-2xl text-emerald-600">+{correctCount * 2}</div>
                <div className="text-xs text-slate-500 font-medium">寶石 💎</div>
              </div>
            </div>

            <button
              onClick={handleFinishSession}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all text-base"
            >
              領取獎勵並返回
            </button>
          </div>
        )}

        {/* Footer Action Bar */}
        {!isFinished && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            {!isAnswerChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer}
                className={`w-full py-3.5 rounded-2xl font-black text-white text-base transition-all shadow-md ${
                  selectedAnswer
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 hover:scale-[1.01] active:scale-95'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                檢查答案
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-2xl font-black text-white text-base transition-all bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
              >
                下一題
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
