import { TOEFLWord } from '../types';

/* Loads the 12,499-word dictionary that ships in public/data.
 *
 * Source: ECDICT (MIT, skywind3000/ECDICT) — the toefl/gre/ielts/cet6/cet4
 * tagged subset, Chinese glosses converted to Taiwan Traditional. Tiers are
 * BNC/COCA frequency deciles, so Tier 1 is the highest-frequency band.
 *
 * Tiers load on demand: the manifest is ~120 KB and each tier ~400 KB, so the
 * app starts fast and only pays for the bands the learner actually opens.
 */

export interface RootGroup {
  r: string;      // display name, e.g. "struct"
  m: string;      // meaning
  k: string;      // class: root / prefix / suffix
  o: string;      // origin language
  e: string[];    // example words present in this dictionary
}

export interface VocabManifest {
  total: number;
  tiers: { n: number; count: number; file: string; bytes: number }[];
  roots: RootGroup[];
}

/* Raw row as written by scripts/build-dataset.mjs */
interface Row {
  w: string;
  t: string;                                   // Chinese gloss
  s: number;                                   // tier 1-10
  g: string[];                                 // exam tags
  ipa?: string;
  en?: string;                                 // English definition
  x?: { k: string; w: string }[];              // inflected forms
  f?: { noun?: string; verb?: string; adj?: string; adv?: string };
  r?: string;                                  // root tag
  c?: number;                                  // Collins 1-5
  o?: number;                                  // Oxford core
}

const BASE = `${import.meta.env.BASE_URL || '/'}data`;

export const TIER_NAMES: Record<number, string> = {
  1: '最高頻核心', 2: '高頻學術', 3: '學術主力', 4: '進階學術', 5: '中階拓展',
  6: '中高難度', 7: '高難度', 8: '罕用學術', 9: '專業論文', 10: '頂尖難字',
};

export const tierCategoryId = (tier: number) => `tier-${tier}`;

/* ECDICT prefixes each sense with a part-of-speech marker: "vt. 建立" */
function posOf(gloss: string): TOEFLWord['pos'] {
  const head = gloss.trim().toLowerCase();
  if (/^(vt|vi|v)\b\.?/.test(head)) return 'v.';
  if (/^(adv|ad)\b\.?/.test(head)) return 'adv.';
  if (/^(adj|a)\b\.?/.test(head)) return 'adj.';
  if (/^n\b\.?/.test(head)) return 'n.';
  return 'phrase';
}

function difficultyOf(tier: number): TOEFLWord['difficulty'] {
  if (tier <= 3) return 'easy';
  if (tier <= 7) return 'medium';
  return 'hard';
}

/* Fields the dictionary cannot supply (mnemonic, example sentence, synonyms)
   are left empty on purpose. The UI hides empty sections, and AI expansion
   fills them in on request — inventing them here would be guessing. */
function toWord(row: Row): TOEFLWord {
  const family = row.f
    ? {
        noun: row.f.noun,
        verb: row.f.verb,
        adj: row.f.adj,
        adv: row.f.adv,
      }
    : undefined;

  return {
    id: `d:${row.w}`,
    word: row.w,
    phonetic: row.ipa ? `/${row.ipa}/` : '',
    pos: posOf(row.t),
    definition: row.t,
    englishDefinition: row.en || '',
    rootTag: row.r ? `${row.r}-` : undefined,
    wordFamily: family,
    mnemonic: '',
    exampleSentence: '',
    translation: '',
    category: tierCategoryId(row.s) as TOEFLWord['category'],
    categoryName: `Tier ${row.s} · ${TIER_NAMES[row.s] || ''}`,
    difficulty: difficultyOf(row.s),
    synonyms: [],
    toeflTopic: row.g.includes('toefl') ? 'TOEFL 高頻' : row.g[0]?.toUpperCase(),
    inflections: row.x,
    examTags: row.g,
    tier: row.s,
    collins: row.c,
    oxfordCore: row.o === 1,
  } as TOEFLWord;
}

let manifestPromise: Promise<VocabManifest> | null = null;

export function loadManifest(): Promise<VocabManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(`${BASE}/index.json`).then((r) => {
      if (!r.ok) throw new Error(`詞庫索引載入失敗 (${r.status})`);
      return r.json();
    });
  }
  return manifestPromise;
}

const tierCache = new Map<number, Promise<TOEFLWord[]>>();

/* Chunk filenames are content-hashed, so the name has to come from the
   manifest rather than being constructed — see scripts/build-dataset.mjs. */
export function loadTier(tier: number): Promise<TOEFLWord[]> {
  let p = tierCache.get(tier);
  if (!p) {
    p = loadManifest()
      .then((mf) => {
        const entry = mf.tiers.find((t) => t.n === tier);
        if (!entry) throw new Error(`詞庫沒有 Tier ${tier}`);
        return fetch(`${BASE}/${entry.file}`);
      })
      .then((r) => {
        if (!r.ok) throw new Error(`Tier ${tier} 載入失敗 (${r.status})`);
        return r.json();
      })
      .then((rows: Row[]) => rows.map(toWord));
    tierCache.set(tier, p);
  }
  return p;
}

/** Loads several tiers at once, skipping any that fail so one bad chunk
 *  cannot blank the whole app. */
export async function loadTiers(tiers: number[]): Promise<TOEFLWord[]> {
  const settled = await Promise.allSettled(tiers.map(loadTier));
  const out: TOEFLWord[] = [];
  for (const s of settled) if (s.status === 'fulfilled') out.push(...s.value);
  return out;
}
