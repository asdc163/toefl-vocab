import React from 'react';
import { X, Brain, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';

interface MemoryScienceGuideModalProps {
  onClose: () => void;
}

export const MemoryScienceGuideModal: React.FC<MemoryScienceGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-slate-800 text-base">人類記憶學邏輯與科學原理</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-emerald-700">
              <span className="bg-emerald-100 p-1 rounded-md text-emerald-800">1</span>
              艾賓浩斯遺忘曲線 (Ebbinghaus Forgetting Curve)
            </h3>
            <p className="text-slate-600">
              研究顯示，學習新單字後 24 小時內會遺忘高達 70% 的內容。本 App 會在最關鍵的遺忘臨界點（1天、3天、7天、14天、30天）自動提醒你復習，將短期記憶轉化為大腦永久海馬體記憶！
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-emerald-700">
              <span className="bg-emerald-100 p-1 rounded-md text-emerald-800">2</span>
              主動回想效應 (Active Recall Effect)
            </h3>
            <p className="text-slate-600">
              光是「看」單字卡只產生被動熟悉感；本 App 的 SRS 翻面卡片強制你在看答案前進行【主動回想】，這會刺激腦神經突觸神經元連結，學習效果大幅提升 300%！
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-emerald-700">
              <span className="bg-emerald-100 p-1 rounded-md text-emerald-800">3</span>
              Leitner 5-Box 萊特納五盒箱複習系統
            </h3>
            <p className="text-slate-600">
              答對的單字會進階到更高層級的盒子，復習間隔時間加長；答錯的單字會立刻歸零回盒 1，確保時間精準花在最脆弱的單字上，絕不浪費時間復習已經熟記的單字。
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-emerald-700">
              <span className="bg-emerald-100 p-1 rounded-md text-emerald-800">4</span>
              雙重編碼與 AI 諧音/字根聯想 (Dual Coding)
            </h3>
            <p className="text-slate-600">
              人類大腦對「文字 + 語義故事 + 音訊發音」有雙重網絡編碼能力。結合 Gemini AI 生成的有趣諧音梗與字根字首拆解，讓單字像貼標籤一樣輕鬆烙印在腦海中。
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 text-xs flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
            <span>每天花 5 分鐘闖關打卡，持之以恆即可輕鬆達到托福破百所需的 8000+ 高頻詞彙量！</span>
          </div>

        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md"
          >
            瞭解，開始輕鬆學單字
          </button>
        </div>

      </div>
    </div>
  );
};
