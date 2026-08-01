import React from 'react';
import { BookOpen, Brain, FileText, Target, Award, Network } from 'lucide-react';

export type NavTab = 'learn' | 'family' | 'srs' | 'reading' | 'diagnostic' | 'stats';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  dueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, dueCount }) => {
  const tabs = [
    { id: 'learn', label: '關卡特訓', icon: BookOpen },
    { id: 'family', label: '舉一反三', icon: Network },
    { id: 'srs', label: 'SRS復習', icon: Brain, badge: dueCount },
    { id: 'reading', label: '托福閱讀', icon: FileText },
    { id: 'diagnostic', label: '分數預測', icon: Target },
    { id: 'stats', label: '成效徽章', icon: Award },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg">
      {/* Six tabs at a fixed 64px each need 384px and overflowed a 320px phone.
          Each tab now shares the row instead, and the label shrinks rather than
          pushing the bar sideways. */}
      <div className="max-w-md mx-auto flex items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NavTab)}
              className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-white animate-bounce shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 whitespace-nowrap truncate max-w-full leading-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
