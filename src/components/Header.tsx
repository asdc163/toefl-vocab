import React, { useState } from 'react';
import { Flame, Sparkles, Gem, Heart, Volume2, VolumeX, Info, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';
import { soundFx } from '../utils/sound';

interface HeaderProps {
  profile: UserProfile;
  onOpenMemoryGuide: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenMemoryGuide,
  onToggleSound,
  soundEnabled
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-100 px-4 py-2.5 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        
        {/* App Brand Logo.
            min-w-0 lets the title truncate instead of forcing the row to wrap;
            the SRS badge sits outside the h1 for the same reason, and only
            appears once there is room for it. */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-200">
            T
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight tracking-tight whitespace-nowrap truncate">
                托福單字隨身學
              </h1>
              <span className="hidden md:inline text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                SRS 記憶法
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate">
              杜林果遊戲化 × 艾賓浩斯間隔重複
            </p>
          </div>
        </div>

        {/* Gamification Stats Status Bar */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Daily Streak */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs whitespace-nowrap">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{profile.streakDays} 天</span>
          </div>

          {/* XP — hidden on the narrowest phones so the app title keeps its room */}
          <div className="hidden sm:flex items-center gap-1 bg-indigo-50 border border-indigo-200/80 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs whitespace-nowrap">
            <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            <span>{profile.xp} XP</span>
          </div>

          {/* Gems */}
          <div className="hidden xs:flex items-center gap-1 bg-sky-50 border border-sky-200/80 text-sky-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs whitespace-nowrap">
            <Gem className="w-4 h-4 text-sky-500 fill-sky-500" />
            <span>{profile.gems}</span>
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1 bg-rose-50 border border-rose-200/80 text-rose-600 px-2 py-1 rounded-full text-xs font-bold shadow-2xs whitespace-nowrap">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>{profile.heartCount}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors active:scale-95"
            title={soundEnabled ? "關閉音效" : "開啟音效"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Memory Science Modal Trigger */}
          <button
            onClick={onOpenMemoryGuide}
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200 active:scale-95"
            title="記憶學原理"
          >
            <Info className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
};
