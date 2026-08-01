/* Builds the vocabulary dataset from ECDICT (MIT, skywind3000/ECDICT).
 *
 *   input : data/ecdict.csv        full dictionary, 770k rows
 *           data/wordroot.txt      structured root/prefix/suffix data
 *   output: public/data/tier-N.json   one chunk per tier, lazy-loaded
 *           public/data/index.json    manifest + roots
 *
 * Run: node scripts/build-dataset.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const OpenCC = require("opencc-js");
const { attachWordFamilies, attachRoots, cleanRoot } = await import("./enrich.mjs");
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Simplified -> Traditional, Taiwan phrasing (网络→網路, 软件→軟體) */
const toTW = OpenCC.Converter({ from: "cn", to: "twp" });

/* ---------- exam tags we keep, most-specific first ---------- */
const EXAM = ["toefl", "gre", "ielts", "cet6", "cet4", "ky", "gk"];

/* ---------- ECDICT `exchange` codes ----------
   p past · d past participle · i ing · 3 third-person · r comparative
   t superlative · s plural · 0 lemma · 1 forms-of-lemma            */
const FORM = { p: "過去式", d: "過去分詞", i: "現在分詞", 3: "第三人稱", r: "比較級", t: "最高級", s: "複數" };

function parseExchange(raw) {
  const out = [];
  if (!raw) return out;
  for (const part of raw.split("/")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const code = part.slice(0, i), val = part.slice(i + 1);
    if (!val || code === "0" || code === "1") continue;   // lemma pointers, not forms
    if (FORM[code]) out.push({ k: FORM[code], w: val });
  }
  return out;
}

/* ---------- CSV reader (quoted fields, embedded newlines) ---------- */
function* rows(file) {
  const text = fs.readFileSync(file, "utf8");
  let f = [], cur = "", q = false, started = false;
  let header = null;
  const push = () => { f.push(cur); cur = ""; };
  const line = () => {
    push();
    if (!header) header = f;
    else { const o = {}; header.forEach((h, i) => o[h] = f[i] ?? ""); pending.push(o); }
    f = [];
  };
  const pending = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"' && cur === "") q = true;
    else if (c === ",") push();
    else if (c === "\n") { line(); while (pending.length) yield pending.shift(); }
    else if (c !== "\r") cur += c;
    started = true;
  }
  if (cur || f.length) { line(); while (pending.length) yield pending.shift(); }
}

console.log("reading ecdict.csv …");
const picked = [];
let scanned = 0;
for (const r of rows(path.join(root, "data", "ecdict.csv"))) {
  scanned++;
  const tags = (r.tag || "").split(" ").filter(Boolean);
  if (!tags.some(t => EXAM.includes(t))) continue;
  if (!r.translation) continue;
  if (!/^[a-zA-Z]+$/.test(r.word)) continue;          // single alphabetic words only
  if (r.word.length < 2) continue;
  picked.push({ r, tags });
}
console.log(`  scanned ${scanned}, exam-tagged ${picked.length}`);

/* Drop rows that are nothing but an inflected form of a lemma we already keep.
   ECDICT lists "founding" separately, glossed only "[計] 鑄造" — a poor card,
   and the form still reaches the user via its lemma's `x` list.

   A 0: pointer alone is not enough to drop: homographs like `found` (建立),
   `saw` (鋸子) and `building` (建築物) also carry one (0:find / 0:see / 0:build)
   while being real words. The tell is whether the row contributes any form
   distinct from itself — `founding` only yields "founding", whereas `found`
   yields founded/founds and `building` yields buildings. */
{
  const have = new Set(picked.map(p => p.r.word.toLowerCase()));
  const before = picked.length;
  const kept = picked.filter(({ r }) => {
    const self = r.word.toLowerCase();
    const m = String(r.exchange || "").match(/(?:^|\/)0:([^/]+)/);
    const lemma = m && m[1].trim().toLowerCase();
    if (!lemma || lemma === self || !have.has(lemma)) return true;
    const ownForms = parseExchange(r.exchange).map(f => f.w.toLowerCase());
    return ownForms.some(w => w !== self);          // has a form of its own -> real word
  });
  picked.length = 0; picked.push(...kept);
  console.log(`  dropped ${before - picked.length} pure inflected forms -> ${picked.length}`);
}

/* Drop cards whose only gloss is a bracketed domain label with no plain sense,
   e.g. "[計] 鑄造" on its own — unhelpful without context. */
{
  const before = picked.length;
  const kept = picked.filter(({ r }) => {
    const t = r.translation.replace(/\\n/g, " ").trim();
    return t.replace(/\[[^\]]{1,6}\]/g, "").trim().length >= 2;
  });
  picked.length = 0; picked.push(...kept);
  console.log(`  dropped ${before - picked.length} domain-label-only glosses -> ${picked.length}`);
}

/* ---------- rank by corpus frequency (lower = more common) ---------- */
const rank = ({ r }) => {
  for (const k of ["frq", "bnc"]) {
    const v = parseInt(r[k], 10);
    if (Number.isFinite(v) && v > 0) return v;
  }
  return Number.MAX_SAFE_INTEGER;
};
picked.sort((a, b) => rank(a) - rank(b) || a.r.word.localeCompare(b.r.word));

/* ---------- clean up a translation block ----------
   ECDICT glosses carry field labels and long tails of rare senses, e.g.
   "a. 永久的, 不變的, 固定的, 持久的 \n n. 燙髮 \n [計] 永久的".
   On a quiz option that noise is actively unhelpful, so field-labelled senses
   are dropped and the list is capped at the senses a learner actually needs. */
const MAX_SENSES = 2;
const MAX_SENSE_CHARS = 30;   // a quiz option has to stay readable on a phone

function zh(s) {
  const senses = toTW(String(s).replace(/\\n/g, "\n"))
    .split("\n")
    .map(x => x.replace(/\[[^\]]{1,6}\]/g, "").replace(/\s{2,}/g, " ").trim())
    .map(x => x.replace(/^[,，、·\s]+|[,，、·\s]+$/g, ""))
    .filter(Boolean);

  /* Stripping a field label can leave a near-duplicate: "[化] 光合作用" becomes
     "光合作用", and "[經] 通行證, 護照" becomes a reordering of a sense already
     listed. Compare the set of comma-separated glosses rather than the string,
     so both exact repeats and reorderings collapse. */
  const POS_RE = /^(?:vt|vi|v|adj|a|adv|ad|n|prep|conj|pron|art|num|int)\b\.?\s*/i;
  const keyOf = x =>
    x.replace(POS_RE, "").split(/[,，、]/).map(t => t.trim()).filter(Boolean).sort().join("|");

  const unique = [];
  const seenKeys = [];
  for (const x of senses) {
    const key = keyOf(x);
    if (!key) continue;
    const parts = new Set(key.split("|"));
    const covered = seenKeys.some(prev => {
      const prevParts = new Set(prev.split("|"));
      const smaller = parts.size <= prevParts.size ? parts : prevParts;
      const larger = smaller === parts ? prevParts : parts;
      return [...smaller].every(t => larger.has(t));   // one sense subsumes the other
    });
    if (covered) continue;
    seenKeys.push(key);
    unique.push(x);
  }

  const kept = (unique.length ? unique : ["—"]).slice(0, MAX_SENSES);

  // trim an over-long sense at a comma rather than mid-word
  return kept
    .map(x => {
      if (x.length <= MAX_SENSE_CHARS) return x;
      const cut = x.slice(0, MAX_SENSE_CHARS);
      const lastComma = Math.max(cut.lastIndexOf(","), cut.lastIndexOf("，"));
      return (lastComma > 8 ? cut.slice(0, lastComma) : cut).trim();
    })
    .join(" · ");
}

/* ---------- tiers: 10 buckets over the frequency-sorted list ---------- */
const TIERS = 10;
const per = Math.ceil(picked.length / TIERS);
const tierOf = i => Math.min(TIERS, Math.floor(i / per) + 1);

const entries = picked.map(({ r, tags }, i) => {
  const e = {
    w: r.word,
    t: zh(r.translation),
    s: tierOf(i),
    g: tags.filter(t => EXAM.includes(t)),
  };
  if (r.phonetic) e.ipa = r.phonetic;
  if (r.definition) e.en = toTW(r.definition.replace(/\\n/g, "; ")).slice(0, 160);
  const ex = parseExchange(r.exchange);
  if (ex.length) e.x = ex;
  const col = parseInt(r.collins, 10);
  if (Number.isFinite(col) && col > 0) e.c = col;      // Collins 1-5 commonness
  if (r.oxford === "1") e.o = 1;                       // Oxford 3000 core word
  return e;
});

/* ---------- word roots ---------- */
console.log("reading wordroot.txt …");
const rawRoots = JSON.parse(fs.readFileSync(path.join(root, "data", "wordroot.txt"), "utf8"));
const known = new Set(entries.map(e => e.w.toLowerCase()));
const roots = [];
for (const [key, v] of Object.entries(rawRoots)) {
  const examples = (v.example || []).filter(w => known.has(String(w).toLowerCase()));
  if (examples.length < 3) continue;                   // only roots we can actually drill
  roots.push({
    r: cleanRoot(key),
    m: toTW(v.meaning || ""),
    k: v.class || "root",
    o: v.origin || "",
    e: examples.slice(0, 24),
  });
}
{
  const merged = new Map();
  for (const r of roots) {
    const prev = merged.get(r.r);
    if (prev) prev.e = [...new Set([...prev.e, ...r.e])].slice(0, 24);
    else merged.set(r.r, r);
  }
  roots.length = 0; roots.push(...merged.values());
}
roots.sort((a, b) => b.e.length - a.e.length);
console.log(`  ${roots.length} roots with >=3 in-vocabulary examples`);

/* ---------- offline enrichment: word families + roots ---------- */
const awl = JSON.parse(fs.readFileSync(path.join(root, "data", "awl.json"), "utf8"));
const fam = attachWordFamilies(entries, roots, awl);
console.log(`  word families: ${fam.fromAWL} from curated AWL, ${fam.fromRoot} root-corroborated, ${fam.rejected} stem groups rejected as unverified`);
const rt = attachRoots(entries, roots);
console.log(`  root tags: ${rt.tagged} words mapped to a root`);

/* ---------- write ---------- */
const outDir = path.join(root, "public", "data");
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) fs.unlinkSync(path.join(outDir, f));

const manifest = { total: entries.length, tiers: [], roots, generated: null };
for (let t = 1; t <= TIERS; t++) {
  const chunk = entries.filter(e => e.s === t);
  const file = `tier-${t}.json`;
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(chunk));
  const bytes = fs.statSync(path.join(outDir, file)).size;
  manifest.tiers.push({ n: t, count: chunk.length, file, bytes });
  console.log(`  tier ${String(t).padStart(2)}: ${String(chunk.length).padStart(5)} words  ${(bytes / 1024).toFixed(0)} KB`);
}
fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify(manifest));

const totalBytes = manifest.tiers.reduce((a, t) => a + t.bytes, 0)
  + fs.statSync(path.join(outDir, "index.json")).size;
console.log(`\ntotal ${entries.length} words, ${(totalBytes / 1048576).toFixed(2)} MB across ${TIERS} lazy-loaded chunks`);

/* ---------- guardrails ---------- */
const errs = [];
if (entries.length < 12000) errs.push(`only ${entries.length} words (expected 12k+)`);
if (entries.some(e => !e.t)) errs.push("entry with empty translation");
if (entries.some(e => /[一-鿿]/.test(e.w))) errs.push("non-latin headword");
if (new Set(entries.map(e => e.w)).size !== entries.length) errs.push("duplicate headword");
if (roots.length < 50) errs.push(`only ${roots.length} usable roots`);
const simplified = entries.filter(e => /[网软实变电脑习题读书张长东车马]/.test(e.t)).length;
if (simplified > 0) errs.push(`${simplified} entries still contain simplified characters`);
if (errs.length) { console.error("\nFAILED:\n  " + errs.join("\n  ")); process.exit(1); }
console.log("all guardrails passed");
