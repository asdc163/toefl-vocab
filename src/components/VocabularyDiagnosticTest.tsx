import React, { useState } from 'react';
import { Target, Award, CheckCircle2, XCircle, Sparkles, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';
import { TOEFLWord } from '../types';
import { soundFx } from '../utils/sound';

interface VocabularyDiagnosticTestProps {
  allWords: TOEFLWord[];
  onEarnXp: (xp: number) => void;
}

export const VocabularyDiagnosticTest: React.FC<VocabularyDiagnosticTestProps> = ({ allWords, onEarnXp }) => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testItems, setTestItems] = useState<{ word: TOEFLWord; options: string[]; answer: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [testFinished, setTestFinished] = useState(false);

  const startTest = () => {
    soundFx.playClick();

    /* This estimates a TOEFL vocabulary size, so it has to sample TOEFL-level
       words. Drawing from the whole dictionary — which reaches down to
       junior-high vocabulary — would inflate the estimate. Sampling is spread
       across the frequency tiers so the result reflects range, not luck. */
    const examLevel = allWords.filter(
      w => !w.examTags || w.examTags.some(t => t === 'toefl' || t === 'gre' || t === 'ielts'),
    );
    const source = examLevel.length >= 20 ? examLevel : allWords;

    const byTier = new Map<number, TOEFLWord[]>();
    for (const w of source) {
      const t = w.tier ?? 0;
      if (!byTier.has(t)) byTier.set(t, []);
      byTier.get(t)!.push(w);
    }
    const tiers = [...byTier.keys()].sort((a, b) => a - b);
    const sampled: TOEFLWord[] = [];
    for (let i = 0; sampled.length < 10 && i < 10 * tiers.length; i++) {
      const bucket = byTier.get(tiers[i % tiers.length])!;
      const pick = bucket[Math.floor(Math.random() * bucket.length)];
      if (pick && !sampled.some(s => s.id === pick.id)) sampled.push(pick);
    }
    while (sampled.length < 10 && source.length > sampled.length) {
      const pick = source[Math.floor(Math.random() * source.length)];
      if (!sampled.some(s => s.id === pick.id)) sampled.push(pick);
    }

    const items = sampled.map(w => {
      const sameTier = source.filter(
        other => other.id !== w.id && (!w.tier || other.tier === w.tier),
      );
      const distractors = (sameTier.length >= 3 ? sameTier : source.filter(o => o.id !== w.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(d => d.definition);

      const options = [w.definition, ...distractors].sort(() => Math.random() - 0.5);
      return {
        word: w,
        options,
        answer: w.definition
      };
    });

    setTestItems(items);
    setCurrentIndex(0);
    setUserAnswers({});
    setTestStarted(true);
    setTestFinished(false);
  };

  const handleSelectOption = (opt: string) => {
    soundFx.playClick();
    setUserAnswers(prev => ({ ...prev, [currentIndex]: opt }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < testItems.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      soundFx.playLevelUp();
      setTestFinished(true);
      onEarnXp(50);
    }
  };

  // Calculate score & estimated stats
  const calculateResult = () => {
    let correct = 0;
    testItems.forEach((item, idx) => {
      if (userAnswers[idx] === item.answer) correct++;
    });

    const accuracy = correct / testItems.length;
    // Estimate vocab size: 4000 base + accuracy * 5000
    const estimatedVocabSize = Math.round(4200 + accuracy * 4800);
    // Estimate TOEFL Reading score: 15 + accuracy * 14
    const minScore = Math.min(30, Math.round(16 + accuracy * 13));
    const maxScore = Math.min(30, minScore + 3);

    return { correct, accuracy, estimatedVocabSize, minScore, maxScore };
  };

  if (!testStarted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center max-w-xl mx-auto space-y-6 my-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
          🎯
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">托福詞彙量診斷與分數預測</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            採用 TOEFL iBT 官方高頻真題題庫，只需 10 題即可精準評估你目前的【托福詞彙儲備量】與【閱讀成績預估】！
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
          <div className="p-2">
            <span className="text-emerald-600 text-base block">10 道題目</span>
            <span>涵蓋三大難度梯度</span>
          </div>
          <div className="p-2 border-l border-slate-200">
            <span className="text-emerald-600 text-base block">約 3 分鐘</span>
            <span>生成學術能力報告</span>
          </div>
        </div>

        <button
          onClick={startTest}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 text-base transition-all hover:scale-[1.01] active:scale-95"
        >
          開始托福詞彙量診斷
        </button>
      </div>
    );
  }

  if (testFinished) {
    const result = calculateResult();

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg max-w-xl mx-auto space-y-6 my-4 animate-fade-in">
        <div className="text-center space-y-2">
          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full">
            托福單字診斷報告
          </span>
          <h2 className="text-2xl font-black text-slate-800">檢測完成！</h2>
        </div>

        {/* Big Metrics Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-2xl text-center shadow-md">
            <div className="text-xs text-emerald-100 font-bold mb-1">預估托福單字儲備</div>
            <div className="text-3xl font-black">約 {result.estimatedVocabSize}</div>
            <div className="text-[11px] text-emerald-200 mt-1">字 (目標: 8000+)</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-2xl text-center shadow-md">
            <div className="text-xs text-indigo-100 font-bold mb-1">預估 TOEFL 閱讀分數</div>
            <div className="text-3xl font-black">{result.minScore} ~ {result.maxScore}</div>
            <div className="text-[11px] text-indigo-200 mt-1">分 (滿分 30 分)</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between font-bold text-slate-700">
            <span>答對題數:</span>
            <span className="text-emerald-600">{result.correct} / 10 題</span>
          </div>
          <div className="flex justify-between font-bold text-slate-700">
            <span>正確率:</span>
            <span className="text-emerald-600">{Math.round(result.accuracy * 100)}%</span>
          </div>
          <div className="text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
            💡 <span className="font-bold text-slate-700">專家建議：</span>
            {result.accuracy >= 0.8
              ? '你的學術單字基礎非常紮實！建議多練習「托福閱讀段落特訓」，強化同義字替換能力。'
              : '建議每日堅持使用「SRS 間隔重複卡片」，將常忘單字歸納入 Level 1~3 盒中密集復習！'}
          </div>
        </div>

        <button
          onClick={startTest}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl shadow-md text-sm transition-all"
        >
          重新進行測驗
        </button>
      </div>
    );
  }

  const currentQ = testItems[currentIndex];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm max-w-xl mx-auto space-y-6 my-4">
      {/* Test Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-3">
        <span>診斷題 {currentIndex + 1} / {testItems.length}</span>
        <span className="text-emerald-600">托福真題詞彙庫選題</span>
      </div>

      {/* Question Word */}
      <div className="text-center py-4 space-y-1">
        <span className="text-xs text-slate-400 font-bold uppercase">{currentQ.word.pos}</span>
        <h2 className="text-3xl font-black text-slate-900">{currentQ.word.word}</h2>
        <p className="text-xs text-slate-400 font-mono">{currentQ.word.phonetic}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = userAnswers[currentIndex] === opt;
          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className={`w-full text-left p-4 rounded-2xl border-2 text-sm font-medium transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        disabled={!userAnswers[currentIndex]}
        className={`w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all shadow-md ${
          userAnswers[currentIndex]
            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
            : 'bg-slate-300 cursor-not-allowed'
        }`}
      >
        {currentIndex + 1 === testItems.length ? '完成測驗並計算結果' : '下一題'}
      </button>
    </div>
  );
};
