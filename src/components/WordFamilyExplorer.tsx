import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, Layers, Volume2, Plus, CheckCircle2, ArrowRight, BookOpen, Network, RefreshCw } from 'lucide-react';
import { TOEFLWord } from '../types';
import { soundFx } from '../utils/sound';

interface WordFamilyExplorerProps {
  allWords: TOEFLWord[];
  onAddWord: (word: TOEFLWord) => void;
  onOpenWordDetail: (word: TOEFLWord) => void;
}

/* How many word cards to render at once. Each card is ~15 DOM nodes. */
const PAGE_SIZE = 30;

const COMMON_ROOTS = [
  { tag: 'ALL', name: '全部字根' },
  { tag: 'hypo-', name: 'hypo- (在...之下/不足)' },
  { tag: 'syn-', name: 'syn-/sym- (共同/結合)' },
  { tag: 'geo-', name: 'geo- (地球/地質)' },
  { tag: 'spect-', name: 'spect- (看/審視)' },
  { tag: 'struct-', name: 'struct- (建造/結構)' },
  { tag: 'bio-', name: 'bio- (生命/生物)' },
  { tag: 'sub-', name: 'sub- (在...下方/亞)' },
  { tag: 'dict-', name: 'dict- (說/指示)' },
  { tag: 'scrib-', name: 'scrib-/script- (寫)' },
  { tag: 'chron-', name: 'chron- (時間)' }
];

const VOCAB_TIERS = [
  { tier: 1, range: '1 - 1,000', label: 'Tier 1 核心學術基礎', topic: 'Academic Research & Argumentation' },
  { tier: 2, range: '1,001 - 2,000', label: 'Tier 2 自然科學與生物學', topic: 'Biology & Evolution' },
  { tier: 3, range: '2,001 - 3,000', label: 'Tier 3 地球地質與環境氣候', topic: 'Geology & Climate' },
  { tier: 4, range: '3,001 - 4,000', label: 'Tier 4 人文歷史與考古美學', topic: 'History & Art' },
  { tier: 5, range: '4,001 - 5,000', label: 'Tier 5 心理學與神經認知', topic: 'Psychology & Brain' },
  { tier: 6, range: '5,001 - 6,000', label: 'Tier 6 天文學與宇宙物理', topic: 'Astronomy & Physics' },
  { tier: 7, range: '6,001 - 7,000', label: 'Tier 7 商業經濟與社會結構', topic: 'Economics & Sociology' },
  { tier: 8, range: '7,001 - 8,000', label: 'Tier 8 語言學與校園生活', topic: 'Linguistics & Campus' },
  { tier: 9, range: '8,001 - 9,000', label: 'Tier 9 法律科技與政治論述', topic: 'Law & Technology' },
  { tier: 10, range: '9,001 - 10,000+', label: 'Tier 10 專家級頂尖論文真題', topic: 'Advanced Dissertation Terms' }
];

export const WordFamilyExplorer: React.FC<WordFamilyExplorerProps> = ({
  allWords,
  onAddWord,
  onOpenWordDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoot, setSelectedRoot] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [aiResultWord, setAiResultWord] = useState<TOEFLWord | null>(null);
  const [addedWordIds, setAddedWordIds] = useState<Record<string, boolean>>({});
  /* The dictionary holds 14k words. Rendering a card for every match produced
     ~208k DOM nodes and froze the tab on a phone, so results are paged. */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Batch generate tier words
  const handleBatchLoadTier = async (tierObj: typeof VOCAB_TIERS[0]) => {
    setIsBatchGenerating(true);
    try {
      const res = await fetch('/api/ai/batch-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierObj.tier, topic: tierObj.topic })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.words)) {
        data.words.forEach((w: TOEFLWord) => {
          onAddWord(w);
          setAddedWordIds(prev => ({ ...prev, [w.id]: true }));
        });
        soundFx.playLevelUp();
      }
    } catch (err) {
      console.error('Failed to batch load tier words:', err);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // Filter local words (memoised — this runs over the whole dictionary)
  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const root = selectedRoot.toLowerCase();
    const rootBare = root.replace('-', '');
    return allWords.filter(w => {
      const matchesSearch =
        !q ||
        w.word.toLowerCase().includes(q) ||
        w.definition.includes(searchQuery.trim()) ||
        (w.rootEtymology && w.rootEtymology.toLowerCase().includes(q));

      const matchesRoot =
        selectedRoot === 'ALL' ||
        (w.rootTag && w.rootTag.toLowerCase().includes(root)) ||
        (w.rootEtymology && w.rootEtymology.toLowerCase().includes(rootBare));

      return matchesSearch && matchesRoot;
    });
  }, [allWords, searchQuery, selectedRoot]);

  const visibleWords = filteredWords.slice(0, visibleCount);

  // A new query should start from the top of the list again
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery, selectedRoot]);

  // Handle AI Full Expansion Search
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    setAiResultWord(null);

    try {
      const res = await fetch('/api/ai/word-expansion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      });
      const data = await res.json();
      if (data.success && data.wordData) {
        setAiResultWord(data.wordData);
        soundFx.playCorrect();
      }
    } catch (err) {
      console.error('AI Word Expansion Search failed:', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleAddAiWordToDatabase = (word: TOEFLWord) => {
    onAddWord(word);
    setAddedWordIds(prev => ({ ...prev, [word.id]: true }));
    soundFx.playLevelUp();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 pt-2">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black bg-emerald-400 text-slate-950 px-3 py-1 rounded-full">
            托福全量字庫 & 舉一反三特訓
          </span>
          <Network className="w-6 h-6 text-emerald-300" />
        </div>
        <h2 className="text-2xl font-black">舉一反三 • 詞性衍生與字根聯想</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          科學記憶法則：記住 1 個核心字根，就能同時通曉名詞、動詞、形容詞與副詞（看 1 字等於掌握 4 字），輕鬆解鎖無限托福學術詞彙庫！
        </p>

        {/* Universal Search Bar */}
        <div className="pt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
              placeholder="搜尋任何托福單字 (如 hypothesize, mitigate, 心理學...)"
              className="w-full bg-white text-slate-900 font-medium pl-10 pr-4 py-3 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
            />
          </div>

          <button
            onClick={handleAiSearch}
            disabled={isAiSearching || !searchQuery.trim()}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-4 py-3 rounded-2xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-900" />
            {isAiSearching ? 'Gemini 檢索中...' : 'AI 全量擴充'}
          </button>
        </div>
      </div>

      {/* 10,000+ Academic Tier Engine */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white">10,000+ 托福 iBT 全量學術詞彙庫 (10 Tiers)</h3>
          </div>
          <span className="text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            已載入 {allWords.length} / 10,000+ 字
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          系統支援完整的 10,000+ 托福真題詞彙分階。點擊下方 Tier 分階可預覽該量級的學術主題，或點擊「一鍵解鎖解構」讓 Gemini AI 動態載入並解析該 Tier 的全新學術真題單字卡！
        </p>

        {/* Tier Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {VOCAB_TIERS.map(t => (
            <button
              key={t.tier}
              onClick={() => {
                soundFx.playClick();
                setSelectedTier(t.tier);
              }}
              className={`p-2.5 rounded-2xl text-left border transition-all ${
                selectedTier === t.tier
                  ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="text-[10px] font-extrabold text-emerald-400 uppercase">Tier {t.tier}</div>
              <div className="text-xs font-black truncate">{t.range} 字</div>
            </button>
          ))}
        </div>

        {/* Selected Tier Banner & Action */}
        {(() => {
          const activeObj = VOCAB_TIERS.find(t => t.tier === selectedTier) || VOCAB_TIERS[0];
          return (
            <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-emerald-300">{activeObj.label}</div>
                <div className="text-xs text-slate-400">主題方向：{activeObj.topic} (包含 {activeObj.range} 量級)</div>
              </div>

              <button
                onClick={() => handleBatchLoadTier(activeObj)}
                disabled={isBatchGenerating}
                className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBatchGenerating ? 'animate-spin' : ''}`} />
                {isBatchGenerating ? 'AI 正在解構批次單字中...' : `解鎖 Tier ${activeObj.tier} 單字批次卡`}
              </button>
            </div>
          );
        })()}
      </div>

      {/* Root Filter Chips */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-2">
        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>🧠 按學術高頻字根篩選 (Root Family)</span>
          <span className="text-emerald-600 font-bold">{filteredWords.length} 個單字</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {COMMON_ROOTS.map(r => (
            <button
              key={r.tag}
              onClick={() => {
                soundFx.playClick();
                setSelectedRoot(r.tag);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedRoot === r.tag
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Expansion Search Result Box (If generated) */}
      {aiResultWord && (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl border-2 border-indigo-300 p-6 shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-200">
              ✨ Gemini AI 即時剖析托福單字卡
            </span>
            <button
              onClick={() => soundFx.speak(aiResultWord.word)}
              className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-full"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900">{aiResultWord.word}</h3>
              <span className="text-xs font-bold text-indigo-700">{aiResultWord.pos}</span>
              <span className="text-xs font-mono text-slate-400">{aiResultWord.phonetic}</span>
            </div>
            <div className="text-base font-bold text-slate-800 mt-1">{aiResultWord.definition}</div>
            <div className="text-xs text-slate-500">{aiResultWord.englishDefinition}</div>
          </div>

          {/* Root & Etymology */}
          {aiResultWord.rootEtymology && (
            <div className="bg-white p-3 rounded-2xl border border-indigo-100 text-xs text-indigo-950">
              <span className="font-bold text-indigo-800">字根拆解: </span>
              {aiResultWord.rootEtymology}
            </div>
          )}

          {/* Word Family */}
          {aiResultWord.wordFamily && (
            <div className="bg-indigo-100/60 p-3 rounded-2xl border border-indigo-200 text-xs space-y-1">
              <div className="font-bold text-indigo-900">🔄 詞性衍生家族 (Word Family):</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                {aiResultWord.wordFamily.noun && <div><b>n.:</b> {aiResultWord.wordFamily.noun}</div>}
                {aiResultWord.wordFamily.verb && <div><b>v.:</b> {aiResultWord.wordFamily.verb}</div>}
                {aiResultWord.wordFamily.adj && <div><b>adj.:</b> {aiResultWord.wordFamily.adj}</div>}
                {aiResultWord.wordFamily.adv && <div><b>adv.:</b> {aiResultWord.wordFamily.adv}</div>}
              </div>
            </div>
          )}

          {/* Mnemonic */}
          <div className="bg-amber-50 p-3 rounded-2xl text-xs text-amber-900 border border-amber-200">
            <span className="font-bold text-amber-800">記憶大腦故事: </span>
            {aiResultWord.mnemonic}
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleAddAiWordToDatabase(aiResultWord)}
            disabled={addedWordIds[aiResultWord.id]}
            className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              addedWordIds[aiResultWord.id]
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {addedWordIds[aiResultWord.id] ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                已成功加入你的個人托福字庫與 SRS 復習盒！
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                加入此單字至個人托福字庫
              </>
            )}
          </button>
        </div>
      )}

      {/* Filtered Word List with Word Family Cards */}
      <div className="space-y-4">
        {visibleWords.map(w => (
          <div
            key={w.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl font-black text-slate-900">{w.word}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {w.pos}
                  </span>
                  <button
                    onClick={() => soundFx.speak(w.word)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-emerald-600 rounded-full active:scale-95 transition-transform"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">{w.definition}</div>
              </div>

              <button
                onClick={() => onOpenWordDetail(w)}
                className="shrink-0 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold px-3 rounded-xl text-xs whitespace-nowrap"
              >
                查看詳細
              </button>
            </div>

            {/* Word Family Matrix */}
            {w.wordFamily && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
                <div className="text-[11px] font-extrabold text-teal-800 mb-1.5 flex items-center gap-1">
                  <span>🔄 詞性衍生家族 (舉一反三):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  {w.wordFamily.noun && (
                    <div><span className="text-slate-400 font-semibold">名詞:</span> {w.wordFamily.noun}</div>
                  )}
                  {w.wordFamily.verb && (
                    <div><span className="text-slate-400 font-semibold">動詞:</span> {w.wordFamily.verb}</div>
                  )}
                  {w.wordFamily.adj && (
                    <div><span className="text-slate-400 font-semibold">形容詞:</span> {w.wordFamily.adj}</div>
                  )}
                  {w.wordFamily.adv && (
                    <div><span className="text-slate-400 font-semibold">副詞:</span> {w.wordFamily.adv}</div>
                  )}
                </div>
              </div>
            )}

            {/* Synonyms & Collocations preview */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {w.rootEtymology && (
                <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md text-[11px]">
                  💡 {w.rootEtymology}
                </span>
              )}
              {w.synonyms.length > 0 && (
                <span className="text-slate-500 text-[11px]">
                  同義詞: <strong className="text-slate-700">{w.synonyms.join(', ')}</strong>
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredWords.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm font-bold text-slate-700">找不到符合的單字</p>
            <p className="text-xs text-slate-500 mt-1">
              換個關鍵字或字根試試，或用上方的「AI 全量擴充」直接生成這個字的完整字卡。
            </p>
          </div>
        )}

        {visibleCount < filteredWords.length && (
          <button
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            className="w-full bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl min-h-[52px] font-bold text-sm text-slate-700 active:scale-[0.98] transition-all"
          >
            載入更多 · 已顯示 {visibleWords.length} / {filteredWords.length.toLocaleString()} 個
          </button>
        )}

        {filteredWords.length > 0 && visibleCount >= filteredWords.length && filteredWords.length > PAGE_SIZE && (
          <p className="text-center text-xs text-slate-400 py-2">
            已顯示全部 {filteredWords.length.toLocaleString()} 個結果
          </p>
        )}
      </div>

    </div>
  );
};
