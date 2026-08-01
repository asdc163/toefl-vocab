/* Derives the two headline features offline, so they work with no API key:
 *
 *   wordFamily  n./v./adj./adv. derivations  ->  「舉一反三」
 *   rootTag     shared Latin/Greek root      ->  「字根網絡」
 *
 * Accuracy is the constraint, not coverage. A naive shared-stem clustering
 * produces confident nonsense — it pairs `empirical` with `empire` (Greek
 * empeiria vs Latin imperium) and `create` with `creature` rather than
 * `creation`. Teaching a false family to someone studying for an exam is worse
 * than teaching nothing, so a family is only emitted when it is corroborated:
 *
 *   1. Coxhead's AWL lists the members explicitly (curated ground truth), or
 *   2. the words share a stem AND the same etymological root from wordroot.txt.
 *
 * Words that clear neither bar get no family; the UI falls back to their real
 * inflections, or to on-demand AI expansion.
 */

/* ECDICT translations carry a part-of-speech marker:
   "vt. 建立, 創立" / "a. 無所不在的" / "ad. 完全地" / "n. 假設" */
const POS_PATTERNS = [
  [/^(?:vt|vi|v)\b\.?/i, "verb"],
  [/^(?:adj|a)\b\.?/i, "adj"],
  [/^(?:adv|ad)\b\.?/i, "adv"],
  [/^n\b\.?/i, "noun"],
];

export function posOf(translation) {
  const hits = new Set();
  for (const seg of String(translation).split(/[·\n]/)) {
    for (const [re, pos] of POS_PATTERNS) {
      if (re.test(seg.trim())) { hits.add(pos); break; }
    }
  }
  return hits;
}

/* Derivational suffixes, longest first so "-ically" wins over "-ly".
   Inflections (-ed/-ing/-s) are deliberately absent: those are word forms. */
const SUFFIXES = [
  ["ically", "adv"], ["ationally", "adv"], ["fully", "adv"], ["lessly", "adv"],
  ["iously", "adv"], ["ently", "adv"], ["antly", "adv"], ["ably", "adv"],
  ["ibly", "adv"], ["ly", "adv"],
  ["ization", "noun"], ["isation", "noun"], ["ification", "noun"],
  ["ation", "noun"], ["ition", "noun"], ["ution", "noun"], ["sion", "noun"],
  ["tion", "noun"], ["ment", "noun"], ["ness", "noun"], ["ity", "noun"],
  ["ance", "noun"], ["ence", "noun"], ["ancy", "noun"], ["ency", "noun"],
  ["ism", "noun"], ["ist", "noun"], ["ship", "noun"], ["hood", "noun"],
  ["ure", "noun"], ["age", "noun"], ["dom", "noun"], ["or", "noun"], ["er", "noun"],
  ["ize", "verb"], ["ise", "verb"], ["ify", "verb"], ["ate", "verb"], ["en", "verb"],
  ["ative", "adj"], ["itive", "adj"], ["ive", "adj"], ["able", "adj"], ["ible", "adj"],
  ["ious", "adj"], ["eous", "adj"], ["ous", "adj"], ["ful", "adj"], ["less", "adj"],
  ["ical", "adj"], ["ic", "adj"], ["ant", "adj"], ["ent", "adj"], ["ary", "adj"],
  ["ish", "adj"], ["al", "adj"],
];

function suffixPos(word) {
  const w = word.toLowerCase();
  for (const [suf, pos] of SUFFIXES) {
    if (w.length > suf.length + 3 && w.endsWith(suf)) return pos;
  }
  return null;
}

function stemOf(word) {
  const w = word.toLowerCase();
  for (const [suf] of SUFFIXES) {
    if (w.length > suf.length + 3 && w.endsWith(suf)) {
      let s = w.slice(0, -suf.length);
      if (s.endsWith("i")) s = s.slice(0, -1) + "y";
      return s.replace(/(.)\1$/, "$1");
    }
  }
  return w;
}
const familyKey = w => {
  const s = stemOf(w).replace(/[ey]$/, "");
  return s.length >= 4 ? s : null;
};

/* Choose one representative per part of speech. The suffix is authoritative
   about what a word *is*; the dictionary marker is the fallback. */
function fillSlots(words, transOf) {
  const slot = { noun: null, verb: null, adj: null, adv: null };
  for (const w of words) {
    const cands = suffixPos(w) ? [suffixPos(w)] : [...posOf(transOf(w) || "")];
    for (const pos of cands) {
      if (!slot[pos] || w.length < slot[pos].length) slot[pos] = w;
    }
  }
  return slot;
}

/* Normalises a wordroot.txt key ("a-1, an-1" / "-logy, -ology") to one clean
   display token. */
export function cleanRoot(key) {
  /* Keys list aliases shortest-first ("hyp-, hypo-", "-logy, -ology"). The
     longer alias is the recognisable one, so prefer it over the stub. */
  return String(key)
    .split(",")
    // strip the disambiguating digit first, or "pro-1" leaves a dangling dash
    .map(s => s.trim().replace(/\d+$/, "").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] || String(key);
}

/**
 * @param entries  dataset rows, mutated in place (adds `f`)
 * @param roots    normalised root records (from build-dataset)
 * @param awl      Coxhead AWL json: { sublist_N: { headword: { subwords: [] } } }
 */
export function attachWordFamilies(entries, roots, awl) {
  const byWord = new Map(entries.map(e => [e.w.toLowerCase(), e]));
  const transOf = w => (byWord.get(w.toLowerCase()) || {}).t;
  const stats = { fromAWL: 0, fromRoot: 0, rejected: 0 };

  /* ---- 1. curated AWL families ---- */
  const claimed = new Set();
  if (awl) {
    for (const sub of Object.values(awl)) {
      for (const [head, v] of Object.entries(sub)) {
        const members = [head, ...(v.subwords || [])]
          .map(String)
          .filter(w => byWord.has(w.toLowerCase()));
        if (members.length < 2) continue;
        const slot = fillSlots(members, transOf);
        if (Object.values(slot).filter(Boolean).length < 2) continue;
        for (const w of members) {
          const e = byWord.get(w.toLowerCase());
          e.f = {};
          for (const k of ["noun", "verb", "adj", "adv"]) if (slot[k]) e.f[k] = slot[k];
          claimed.add(w.toLowerCase());
          stats.fromAWL++;
        }
      }
    }
  }

  /* ---- 2. stem groups, but only where the root agrees ---- */
  const rootOf = new Map();
  for (const r of roots) for (const ex of r.e) rootOf.set(String(ex).toLowerCase(), r.r);

  const groups = new Map();
  for (const e of entries) {
    if (claimed.has(e.w.toLowerCase())) continue;
    const k = familyKey(e.w);
    if (!k) continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(e);
  }

  for (const members of groups.values()) {
    if (members.length < 2) continue;
    /* every member must be tagged with the same etymological root — this is
       what rejects empirical/empire and create/creature */
    const tags = members.map(m => rootOf.get(m.w.toLowerCase()));
    if (tags.some(t => !t) || new Set(tags).size !== 1) { stats.rejected++; continue; }

    const slot = fillSlots(members.map(m => m.w), transOf);
    if (Object.values(slot).filter(Boolean).length < 2) continue;
    for (const m of members) {
      m.f = {};
      for (const k of ["noun", "verb", "adj", "adv"]) if (slot[k]) m.f[k] = slot[k];
      stats.fromRoot++;
    }
  }
  return stats;
}

export function attachRoots(entries, roots) {
  const byWord = new Map();
  for (const r of roots) {
    for (const ex of r.e) {
      const k = String(ex).toLowerCase();
      const prev = byWord.get(k);
      if (!prev || r.r.length > prev.r.length) byWord.set(k, r);
    }
  }
  let tagged = 0;
  for (const e of entries) {
    const hit = byWord.get(e.w.toLowerCase());
    if (hit) { e.r = cleanRoot(hit.r); tagged++; }
  }
  return { tagged };
}
