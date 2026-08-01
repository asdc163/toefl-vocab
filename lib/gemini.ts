/* Gemini-backed handlers, shared by the local dev server (server.ts) and the
 * Vercel serverless routes (api/ai/[action].ts) so the two cannot drift.
 *
 * AI is optional in this build: the 14,131-word dictionary ships with the app
 * and every screen works without a key. These endpoints only add on-demand
 * extras (mnemonics, example sentences, words outside the dictionary), so a
 * missing key returns a clear 503 rather than crashing the app.
 */
/* Talks to Gemini over its REST endpoint rather than through @google/genai.
 *
 * The SDK is ESM-only and ~450 KB; bundling it into the serverless function
 * produced a module that crashed on load (FUNCTION_INVOCATION_FAILED on every
 * request, including ones that never touched Gemini). All this route needs is
 * a single generateContent call, which is one fetch — so the dependency is
 * gone and the function is a few KB instead. */

const MODEL = 'gemini-3.6-flash';
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

/* Mirrors the SDK's Type enum, which is a plain string enum. */
const Type = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
} as const;

export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpstreamError';
  }
}

export class MissingKeyError extends Error {
  constructor() {
    super('GEMINI_API_KEY is not configured');
    this.name = 'MissingKeyError';
  }
}

export function isAIEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/* Gemini can take a while on the longer prompts; without a ceiling a hung
   upstream would hold the function open until the platform kills it. */
const TIMEOUT_MS = 25_000;

const STR = { type: Type.STRING } as const;
const STR_ARRAY = { type: Type.ARRAY, items: { type: Type.STRING } } as const;
const WORD_FAMILY = {
  type: Type.OBJECT,
  properties: { noun: STR, verb: STR, adj: STR, adv: STR },
} as const;

const WORD_CARD_PROPS = {
  word: STR, phonetic: STR, pos: STR, definition: STR, englishDefinition: STR,
  rootEtymology: STR, rootTag: STR, wordFamily: WORD_FAMILY,
  collocations: STR_ARRAY, mnemonic: STR, exampleSentence: STR, translation: STR,
  category: STR, categoryName: STR, difficulty: STR,
  synonyms: STR_ARRAY, antonyms: STR_ARRAY, toeflTopic: STR,
} as const;

const WORD_CARD_REQUIRED = [
  'word', 'phonetic', 'definition', 'englishDefinition', 'rootEtymology',
  'wordFamily', 'mnemonic', 'exampleSentence', 'translation', 'synonyms',
];

async function generate(prompt: string, responseSchema: unknown) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new MissingKeyError();

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(ENDPOINT(MODEL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      }),
      signal: ctl.signal,
    });
  } catch (err) {
    throw new UpstreamError(
      (err as Error).name === 'AbortError' ? 'Gemini 回應逾時' : `無法連線至 Gemini：${(err as Error).message}`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    /* Surface the cause without echoing the key back to the caller. */
    throw new UpstreamError(`Gemini 回應 ${res.status}${detail ? `：${detail.slice(0, 300)}` : ''}`);
  }

  const payload = await res.json().catch(() => null) as any;
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') {
    const blocked = payload?.promptFeedback?.blockReason;
    throw new UpstreamError(blocked ? `Gemini 拒絕回應（${blocked}）` : 'Gemini 回傳格式無法解析');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new UpstreamError('Gemini 回傳的內容不是有效 JSON');
  }
}

export type AIAction =
  | 'mnemonic' | 'explain' | 'word-expansion' | 'batch-words' | 'reading-passage';

export const AI_ACTIONS: AIAction[] = [
  'mnemonic', 'explain', 'word-expansion', 'batch-words', 'reading-passage',
];

/** Runs one AI action. Throws MissingKeyError when no key is configured. */
export async function runAction(action: AIAction, body: Record<string, any>) {
  switch (action) {
    case 'mnemonic': {
      const { word, definition, pos } = body;
      if (!word) throw new BadRequest('缺少 word 參數');
      const data = await generate(
        `你是一位精通人類記憶心理學（如雙重編碼理論、諧音聯想、字根字首記憶法）與托福考試的權威名師。
請為托福單字 "${word}" (${pos || ''} ${definition || ''}) 設計最適合人類大腦快速記憶的【諧音/圖像聯想/字根記憶故事】。

請輸出 JSON 格式，包含：
1. "rootBreakdown": 字根字首字尾拆解說明 (如 "hypo-(在...之下) + thesis(論點)")
2. "mnemonicStory": 圖像化或趣味諧音故事聯想 (約 50-80 字，活潑、好記、深植腦海)
3. "toeflTip": 托福考試中常見的同義詞替換或閱讀高頻搭配詞 (30字以內)`,
        {
          type: Type.OBJECT,
          properties: { rootBreakdown: STR, mnemonicStory: STR, toeflTip: STR },
          required: ['rootBreakdown', 'mnemonicStory', 'toeflTip'],
        },
      );
      return { success: true, ...data };
    }

    case 'explain': {
      const { word } = body;
      if (!word) throw new BadRequest('缺少 word 參數');
      const data = await generate(
        `請針對托福高頻詞彙 "${word}" 進行深度學術解析：
包含：
1. 托福核心學術含義 (Traditional Chinese)
2. 常用學術搭配詞 (Academic Collocations, 至少 3 個)
3. 托福閱讀測驗中最常見的同義字替換 (Synonyms) 與易混淆陷阱詞 (Distractors)
4. 一句標準托福閱讀例句與中文翻譯`,
        {
          type: Type.OBJECT,
          properties: {
            academicMeaning: STR, collocations: STR_ARRAY, synonyms: STR_ARRAY,
            distractors: STR_ARRAY, exampleSentence: STR, translation: STR,
          },
          required: ['academicMeaning', 'collocations', 'synonyms', 'exampleSentence', 'translation'],
        },
      );
      return { success: true, ...data };
    }

    case 'word-expansion': {
      const { query } = body;
      if (!query) throw new BadRequest('缺少 query 參數');
      const data = await generate(
        `你是一位托福 iBT 字彙與大腦記憶科學專家。使用者查詢了單字或主題："${query}"。
請為此查詢生成完整且權威的托福單字卡與「舉一反三（詞性家族、字根網、同反義詞、搭配詞、圖像諧音聯想）」資料。

請輸出 JSON 格式：
1. "word": 核心單字 (原型)
2. "phonetic": 音標 (IPA)
3. "pos": 詞性 ("n." | "v." | "adj." | "adv." | "phrase")
4. "definition": 繁體中文精準釋義
5. "englishDefinition": 英文學術解釋
6. "rootEtymology": 字根字首字尾拆解
7. "rootTag": 核心字根標籤 (如 "hypo-", "syn-", "geo-", "spect-", "struct-")
8. "wordFamily": 物件，包含詞性衍生 { "noun", "verb", "adj", "adv" }
9. "collocations": 陣列，3個托福高頻搭配詞
10. "mnemonic": 諧音聯想或大腦記憶故事 (約40字)
11. "exampleSentence": 托福閱讀真題風格英文例句
12. "translation": 例句繁體中文翻譯
13. "category": 類別 ("academic" | "biology" | "environment" | "humanities" | "psychology" | "astronomy" | "campus")
14. "categoryName": 類別中文名稱
15. "synonyms": 陣列，3個常見托福替換詞
16. "antonyms": 陣列，1-2個反義詞
17. "toeflTopic": 托福學術子領域標籤`,
        { type: Type.OBJECT, properties: WORD_CARD_PROPS, required: WORD_CARD_REQUIRED },
      );
      return { success: true, wordData: { ...data, id: `ai_expanded_${Date.now()}` } };
    }

    case 'batch-words': {
      const tier = Number(body.tier) || 1;
      const topic = body.topic || 'General Academic';
      const items = await generate(
        `你是一位托福 iBT 詞彙資料庫專家。請為托福 Tier ${tier} 階梯詞彙庫（主題: "${topic}"，目標對應托福 ${tier * 1000} 詞彙量級）生成 8 個高品質高頻托福單字卡。
每個單字卡必須包含完整的「舉一反三（詞性家族、字根標籤、學術搭配詞、諧音記憶故事、真題例句）」。
categoryName 請填 "托福學術階梯 Tier ${tier}"，toeflTopic 請填 "${topic}"。`,
        { type: Type.ARRAY, items: { type: Type.OBJECT, properties: WORD_CARD_PROPS, required: WORD_CARD_REQUIRED } },
      );
      const words = (Array.isArray(items) ? items : []).map((item: any, idx: number) => ({
        ...item,
        id: `batch_tier${tier}_${Date.now()}_${idx}`,
      }));
      return { success: true, words };
    }

    case 'reading-passage': {
      const targetWords = Array.isArray(body.words) && body.words.length
        ? body.words
        : ['empirical', 'scrutinize', 'corroborate'];
      const passageTopic = body.topic || 'Biological Evolution and Research Methods';
      const data = await generate(
        `請生成篇幅約 100-140 字的【托福 iBT 學術閱讀段落】。
主題：${passageTopic}
文章中必須自然融入以下目標托福單字：${targetWords.join(', ')}。
並附上 2 題托福閱讀理解選擇題（4 選 1），每題需有正確答案索引與繁體中文詳解。`,
        {
          type: Type.OBJECT,
          properties: {
            title: STR, topic: STR, content: STR, targetWords: STR_ARRAY,
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: STR, options: STR_ARRAY,
                  answerIndex: { type: Type.NUMBER }, explanation: STR,
                },
                required: ['question', 'options', 'answerIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'content', 'questions'],
        },
      );
      return { success: true, passage: { ...data, id: `ai_passage_${Date.now()}` } };
    }

    default:
      throw new BadRequest(`未知的 AI 動作：${action}`);
  }
}

export class BadRequest extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequest';
  }
}
