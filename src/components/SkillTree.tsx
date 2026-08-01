import React, { useMemo } from 'react';
import { Play, CheckCircle2, Lock, Flame, Sparkles, BookMarked, Zap, Lightbulb } from 'lucide-react';
import { TOEFLWord, UserProfile, UserWordProgress } from '../types';
import { soundFx } from '../utils/sound';

interface SkillTreeProps {
  words: TOEFLWord[];
  profile: UserProfile;
  progressMap: Record<string, UserWordProgress>;
  onStartQuiz: (category?: string) => void;
  onOpenWordDetail: (word: TOEFLWord) => void;
}

/* A unit can hold 1,400+ words. Rendering a button for each one produced
   ~14k DOM nodes and locked up scrolling on a phone, so only a preview is
   rendered and the rest are reached through the quiz. */
const PREVIEW_CHIPS = 12;

interface UnitCategory {
  id: string;
  name: string;
  enName: string;
  icon: string;
  color: string;
  description: string;
}

const UNITS: UnitCategory[] = [
  {
    id: 'academic',
    name: '學術研究基礎',
    enName: 'Academic Research',
    icon: '🔬',
    color: 'from-emerald-500 to-teal-600',
    description: '假設、實證數據、證實論點、精準描繪'
  },
  {
    id: 'biology',
    name: '自然科學與生物',
    enName: 'Biology & Life Science',
    icon: '🌿',
    color: 'from-green-500 to-emerald-600',
    description: '光合作用、共生關係、土生特有種、休眠'
  },
  {
    id: 'environment',
    name: '地球與環境科學',
    enName: 'Geology & Climate',
    icon: '🌋',
    color: 'from-cyan-500 to-blue-600',
    description: '降水量、冰河消退、沉積物、地熱能'
  },
  {
    id: 'humanities',
    name: '歷史藝術與人文',
    enName: 'History & Arts',
    icon: '🏛️',
    color: 'from-amber-500 to-orange-600',
    description: '史前文物、先例法案、視覺美學'
  },
  {
    id: 'psychology',
    name: '社會科學與心理',
    enName: 'Psychology & Social',
    icon: '🧠',
    color: 'from-purple-500 to-indigo-600',
    description: '認知功能、人口統計、行為誘因'
  },
  {
    id: 'astronomy',
    name: '天體與物理學',
    enName: 'Astronomy & Physics',
    icon: '🪐',
    color: 'from-violet-600 to-purple-800',
    description: '天體運動、星等亮度、重力與軌道'
  },
  {
    id: 'campus',
    name: '校園生活與聽力',
    enName: 'Campus & Lecture',
    icon: '🎓',
    color: 'from-rose-500 to-pink-600',
    description: '先修課、博士論文、學術誠信抄襲'
  }
];

/* The ten frequency tiers of the shipped dictionary. Tier 1 holds the most
   common words, Tier 10 the rarest — so working down the list is also working
   from best to worst return on study time. */
const TIER_META: { name: string; desc: string; icon: string; color: string }[] = [
  { name: '最高頻核心', desc: '出現率最高的一批，先掌握這些最划算', icon: '①', color: 'from-emerald-500 to-teal-600' },
  { name: '高頻學術',   desc: '學術文章反覆出現的骨幹詞彙',           icon: '②', color: 'from-teal-500 to-cyan-600' },
  { name: '學術主力',   desc: '閱讀與聽力的主要負擔區間',             icon: '③', color: 'from-cyan-500 to-sky-600' },
  { name: '進階學術',   desc: '拉開分數差距的關鍵區間',               icon: '④', color: 'from-sky-500 to-blue-600' },
  { name: '中階拓展',   desc: '閱讀長文時的理解瓶頸',                 icon: '⑤', color: 'from-blue-500 to-indigo-600' },
  { name: '中高難度',   desc: '學術論述與抽象概念用詞',               icon: '⑥', color: 'from-indigo-500 to-violet-600' },
  { name: '高難度',     desc: '進入 GRE 重疊區',                      icon: '⑦', color: 'from-violet-500 to-purple-600' },
  { name: '罕用學術',   desc: '低頻但仍會考的學術詞',                 icon: '⑧', color: 'from-purple-500 to-fuchsia-600' },
  { name: '專業論文',   desc: '專業期刊等級的用字',                   icon: '⑨', color: 'from-fuchsia-600 to-pink-600' },
  { name: '頂尖難字',   desc: '滿分保險區，行有餘力再攻',             icon: '⑩', color: 'from-pink-600 to-rose-700' },
];

export const TIER_UNITS: UnitCategory[] = TIER_META.map((m, i) => ({
  id: `tier-${i + 1}`,
  name: `Tier ${i + 1} · ${m.name}`,
  enName: `Frequency band ${i + 1} of 10`,
  icon: m.icon,
  color: m.color,
  description: m.desc,
}));

export const SkillTree: React.FC<SkillTreeProps> = ({
  words,
  profile,
  progressMap,
  onStartQuiz,
  onOpenWordDetail
}) => {
  /* One pass over the dictionary, not one per unit. With 14k words and 17
     units the old per-unit filter was ~240k comparisons on every render. */
  const statsByCategory = useMemo(() => {
    const map = new Map<string, { total: number; learned: number; mastered: number; words: TOEFLWord[] }>();
    for (const w of words) {
      let s = map.get(w.category);
      if (!s) { s = { total: 0, learned: 0, mastered: 0, words: [] }; map.set(w.category, s); }
      s.total++;
      const stage = progressMap[w.id]?.srsStage || 0;
      if (stage > 0) s.learned++;
      if (stage >= 4) s.mastered++;
      // Only the preview chips are ever rendered, so stop collecting past that.
      if (s.words.length < PREVIEW_CHIPS) s.words.push(w);
    }
    return map;
  }, [words, progressMap]);

  const EMPTY = { total: 0, learned: 0, mastered: 0, words: [] as TOEFLWord[] };
  const getUnitStats = (catId: string) => statsByCategory.get(catId) || EMPTY;

  const dailyPercentage = Math.min(100, Math.round((profile.dailyCompleted / profile.dailyGoal) * 100));

  return (
    <div className="space-y-6 pb-24 pt-2">
      
      {/* Top Banner: Daily Goal & Quick Action */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-5 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white p-1.5 rounded-xl text-lg">🎯</span>
            <h2 className="font-extrabold text-lg">今日學習目標</h2>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
            {profile.dailyCompleted} / {profile.dailyGoal} 個單字
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden mb-4 p-0.5 border border-white/20">
          <div
            className="bg-gradient-to-r from-amber-300 to-emerald-300 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${dailyPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-emerald-100 font-medium">
            {dailyPercentage >= 100
              ? '🎉 太棒了！今天目標已達成！持續鍛鍊保持連勝！'
              : '每天只要 5 分鐘，輕鬆累積托福真題高頻詞彙！'}
          </p>

          <button
            onClick={() => {
              soundFx.playClick();
              onStartQuiz();
            }}
            className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black px-4 min-h-[44px] rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm shrink-0"
          >
            <Zap className="w-4 h-4 fill-slate-900" />
            快速闖關特訓
          </button>
        </div>
      </div>

      {/* 10,000+ Word Bank Engine Live Badge */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl font-black text-xs">
            🌐 10,000+
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>托福 iBT 全量雲端詞庫引擎</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">連線中</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              現已為你載入精選核心卡（目前已載入: {words.length} 字），可至「舉一反三」分頁按 Tier 1~10 隨時解鎖 10,000+ 階梯真題
            </div>
          </div>
        </div>
      </div>

      {/* Memory Science Quick Tip Callout */}
      <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-2xs">
        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold">人類大腦記憶科學法則：</span>
          「主動回想 (Active Recall) + 間隔重複 (SRS)」比死記硬背高出 300% 記憶留存率。本系統會自動在你快忘記時安排最佳復習時間！
        </div>
      </div>

      {/* Duolingo-style Unit Path List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-600" />
            托福核心主題單元
          </h3>
          <span className="text-xs text-slate-500 font-medium">主題精修 + 詞頻階梯</span>
        </div>

        <div className="space-y-4">
          {/* Curated topical units first, then the frequency tiers. Units with
              no loaded words are hidden so a tier that has not been fetched yet
              does not show up as an empty shell. */}
          {[...UNITS, ...TIER_UNITS].filter(u => getUnitStats(u.id).total > 0).map((unit, index) => {
            const stats = getUnitStats(unit.id);
            const isUnlocked = true;
            const progressPercent = stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;

            return (
              <div
                key={unit.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 shadow-sm hover:shadow-md ${
                  isUnlocked ? 'border-slate-200 hover:border-emerald-300' : 'border-slate-200/60 opacity-75 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${unit.color} flex items-center justify-center text-2xl shadow-md text-white shrink-0`}>
                      {unit.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-800 text-base">{unit.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono font-medium hidden xs:inline">
                          {unit.enName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{unit.description}</p>
                    </div>
                  </div>

                  {/* Start or Lock Button */}
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onStartQuiz(unit.id);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 min-h-[44px] rounded-xl text-xs shadow-md shadow-emerald-200 hover:scale-105 active:scale-95 transition-all shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      挑戰
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1 bg-slate-200 text-slate-600 px-4 min-h-[44px] rounded-xl text-xs font-semibold shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                      未解鎖
                    </div>
                  )}
                </div>

                {/* Progress Bar & Word Chips */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>學習進度: {stats.learned} / {stats.total} 詞彙</span>
                    <span className="font-bold text-emerald-600">{progressPercent}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Quick word list chips (preview only — see PREVIEW_CHIPS) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stats.words.map(w => {
                      const wordProg = progressMap[w.id];
                      const isLearned = (wordProg?.srsStage || 0) > 0;
                      const isMastered = (wordProg?.srsStage || 0) >= 4;

                      return (
                        <button
                          key={w.id}
                          onClick={() => onOpenWordDetail(w)}
                          className={`text-xs px-3 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border font-medium transition-all active:scale-95 ${
                            isMastered
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : isLearned
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {w.word}
                          {isMastered && ' ★'}
                        </button>
                      );
                    })}

                    {stats.total > stats.words.length && (
                      <button
                        onClick={() => onStartQuiz(unit.id)}
                        className="text-xs px-3 min-h-[44px] inline-flex items-center rounded-lg border border-dashed border-emerald-300 text-emerald-700 bg-emerald-50/50 font-semibold transition-all active:scale-95"
                      >
                        還有 {stats.total - stats.words.length} 個 · 開始練習
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
