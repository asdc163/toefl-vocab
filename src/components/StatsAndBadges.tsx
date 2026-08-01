import React from 'react';
import { Award, Brain, Flame, Sparkles, Gem, CheckCircle2, Lock, TrendingUp } from 'lucide-react';
import { UserProfile, UserWordProgress, TOEFLWord } from '../types';
import { UNLOCKABLE_BADGES } from '../data/toeflVocabulary';

interface StatsAndBadgesProps {
  profile: UserProfile;
  progressMap: Record<string, UserWordProgress>;
  allWords: TOEFLWord[];
}

export const StatsAndBadges: React.FC<StatsAndBadgesProps> = ({ profile, progressMap, allWords }) => {
  // Count words by stage 0..5
  const stageCounts = [0, 0, 0, 0, 0, 0];
  allWords.forEach(w => {
    const stage = progressMap[w.id]?.srsStage || 0;
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  const learnedTotal = stageCounts.slice(1).reduce((a, b) => a + b, 0);
  const masteredTotal = stageCounts[4] + stageCounts[5];

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24 pt-2">
      
      {/* Profile Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
              托福單字特訓員
            </span>
            <h2 className="text-2xl font-black mt-2">學習戰績總覽</h2>
          </div>
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-400 to-teal-300 rounded-2xl flex items-center justify-center text-slate-900 text-2xl font-black shadow-lg">
            🔥
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <div className="text-2xl font-black text-amber-400">{profile.streakDays}</div>
            <div className="text-[11px] text-slate-300">連續打卡天數</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <div className="text-2xl font-black text-emerald-400">{learnedTotal}</div>
            <div className="text-[11px] text-slate-300">已學習單字數</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <div className="text-2xl font-black text-sky-400">{masteredTotal}</div>
            <div className="text-[11px] text-slate-300">高熟練度單字</div>
          </div>
        </div>
      </div>

      {/* SRS Leitner Boxes Stage Distribution */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-emerald-600" />
          艾賓浩斯記憶盒單字佈局
        </h3>

        <div className="space-y-3">
          {[
            { label: 'Level 0: 未學習新單字', count: stageCounts[0], color: 'bg-slate-300', desc: '等待觸發特訓' },
            { label: 'Level 1: 復習間隔 1 天', count: stageCounts[1], color: 'bg-rose-400', desc: '短期記憶鞏固中' },
            { label: 'Level 2: 復習間隔 3 天', count: stageCounts[2], color: 'bg-amber-400', desc: '漸入佳境' },
            { label: 'Level 3: 復習間隔 7 天', count: stageCounts[3], color: 'bg-yellow-400', desc: '大腦網絡延伸' },
            { label: 'Level 4: 復習間隔 14 天', count: stageCounts[4], color: 'bg-emerald-400', desc: '長期記憶形成' },
            { label: 'Level 5: 復習間隔 30 天 (精通)', count: stageCounts[5], color: 'bg-emerald-600', desc: '永久腦海印記' }
          ].map((item, idx) => {
            const percentage = allWords.length > 0 ? Math.round((item.count / allWords.length) * 100) : 0;
            return (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>{item.label}</span>
                  <span className="text-slate-500">{item.count} 個 ({percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          解鎖成就榮譽榜
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {UNLOCKABLE_BADGES.map((b) => {
            const isUnlocked =
              (b.requiredWords && learnedTotal >= b.requiredWords) ||
              (b.requiredStreak && profile.streakDays >= b.requiredStreak) ||
              profile.badges.includes(b.id);

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
                }`}
              >
                <div className="text-3xl shrink-0">{b.icon}</div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    {b.title}
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{b.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
