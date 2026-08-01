import React, { useState } from 'react';
import { X, Volume2, Sparkles, BookOpen, Lightbulb, Layers, FileText } from 'lucide-react';
import { TOEFLWord, UserWordProgress } from '../types';
import { soundFx } from '../utils/sound';

interface WordDetailModalProps {
  word: TOEFLWord | null;
  progress?: UserWordProgress;
  onClose: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({ word, progress, onClose }) => {
  const [aiData, setAiData] = useState<{
    academicMeaning?: string;
    collocations?: string[];
    synonyms?: string[];
    distractors?: string[];
    exampleSentence?: string;
    translation?: string;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!word) return null;

  const handleFetchAiDetails = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.word })
      });
      const data = await res.json();
      if (data.success) {
        setAiData(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI details:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            {word.categoryName} • {word.pos}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Word Title */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{word.word}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{word.phonetic}</p>
            </div>

            <button
              onClick={() => soundFx.speak(word.word)}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl transition-colors shadow-2xs"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Definition */}
          <div className="space-y-1">
            <div className="text-xl font-bold text-slate-800">{word.definition}</div>
            <div className="text-xs text-slate-500">{word.englishDefinition}</div>
          </div>

          {/* Root Etymology & Root Network Tag */}
          {(word.rootEtymology || word.rootTag) && (
            <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 border border-slate-200 space-y-1">
              {word.rootTag && (
                <div className="inline-block bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md text-[11px] mb-1">
                  字根標籤: {word.rootTag}
                </div>
              )}
              {word.rootEtymology && (
                <div>
                  <span className="font-bold text-emerald-700">字根字首拆解: </span>
                  {word.rootEtymology}
                </div>
              )}
            </div>
          )}

          {/* Word Family Matrix (舉一反三詞性衍生網) */}
          {word.wordFamily && (
            <div className="bg-teal-50/60 p-3.5 rounded-2xl border border-teal-200 text-xs space-y-2">
              <div className="font-extrabold text-teal-900 flex items-center justify-between">
                <span>🔄 舉一反三 • 詞性家族衍生網</span>
                <span className="text-[10px] text-teal-700 font-medium">看1字學4字</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {word.wordFamily.noun && (
                  <div className="bg-white/80 p-2 rounded-xl border border-teal-100">
                    <span className="font-bold text-teal-800 mr-1">名詞 (n.):</span>
                    <span className="font-semibold text-slate-800">{word.wordFamily.noun}</span>
                  </div>
                )}
                {word.wordFamily.verb && (
                  <div className="bg-white/80 p-2 rounded-xl border border-teal-100">
                    <span className="font-bold text-teal-800 mr-1">動詞 (v.):</span>
                    <span className="font-semibold text-slate-800">{word.wordFamily.verb}</span>
                  </div>
                )}
                {word.wordFamily.adj && (
                  <div className="bg-white/80 p-2 rounded-xl border border-teal-100">
                    <span className="font-bold text-teal-800 mr-1">形容詞 (adj.):</span>
                    <span className="font-semibold text-slate-800">{word.wordFamily.adj}</span>
                  </div>
                )}
                {word.wordFamily.adv && (
                  <div className="bg-white/80 p-2 rounded-xl border border-teal-100">
                    <span className="font-bold text-teal-800 mr-1">副詞 (adv.):</span>
                    <span className="font-semibold text-slate-800">{word.wordFamily.adv}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Collocations (學術高頻搭配詞) */}
          {word.collocations && word.collocations.length > 0 && (
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-700">學術高頻搭配詞 (Collocations):</span>
              <div className="flex flex-wrap gap-1.5">
                {word.collocations.map((c, idx) => (
                  <span key={idx} className="bg-teal-50 text-teal-900 border border-teal-200 px-2.5 py-1 rounded-lg font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mnemonic */}
          <div className="bg-amber-50 p-3.5 rounded-2xl text-xs text-amber-900 border border-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              記憶聯想 (Mnemonic):
            </div>
            <p className="leading-relaxed">{word.mnemonic}</p>
          </div>

          {/* TOEFL Example Sentence */}
          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-1 text-xs">
            <div className="font-bold text-emerald-900">托福閱讀真題例句:</div>
            <p className="text-slate-800 font-medium leading-relaxed">{word.exampleSentence}</p>
            <p className="text-slate-500">{word.translation}</p>
          </div>

          {/* Synonyms & Antonyms */}
          {word.synonyms.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-700">常見學術同義字 (Synonyms):</span>
              <div className="flex flex-wrap gap-1.5">
                {word.synonyms.map((s, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Academic Deep Dive Button */}
          {!aiData ? (
            <button
              onClick={handleFetchAiDetails}
              disabled={isLoadingAi}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isLoadingAi ? 'Gemini 剖析托福迷思與搭配詞中...' : 'Gemini AI 托福深度學術解析'}
            </button>
          ) : (
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 text-xs space-y-2 text-indigo-950 animate-fade-in">
              <div className="font-bold text-indigo-900 flex items-center gap-1 text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Gemini 學術搭配詞與考試迷思
              </div>

              {aiData.collocations && aiData.collocations.length > 0 && (
                <div>
                  <span className="font-bold text-indigo-800">常見搭配詞 (Collocations): </span>
                  {aiData.collocations.join(' • ')}
                </div>
              )}

              {aiData.distractors && aiData.distractors.length > 0 && (
                <div>
                  <span className="font-bold text-rose-800">托福閱讀干擾項 Trap: </span>
                  {aiData.distractors.join(' • ')}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
