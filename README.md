# 托福單字隨身學

TOEFL 學術單字 App。內建 **12,499 個考試字彙**，含中文釋義、IPA 音標、詞性衍生家族與字根網絡，搭配 SRS 間隔重複與闖關測驗。純前端可離線使用，AI 擴充為選配。

```bash
npm install
npm run data:build   # 由 ECDICT 產生詞庫（首次或更新資料時）
npm run dev          # http://localhost:3000
```

## 詞庫

| 來源 | 內容 | 授權 |
|---|---|---|
| [ECDICT](https://github.com/skywind3000/ECDICT) | 12,499 字（toefl / gre / ielts / cet6 / cet4，排除國中基礎字）、中文釋義、IPA、詞形變化、BNC/COCA 詞頻 | MIT |
| [ECDICT wordroot](https://github.com/skywind3000/ECDICT) | 426 組字根字首，含詞源與例字 | MIT |
| [Coxhead AWL (2000)](https://github.com/lpmi-13/machine_readable_wordlists) | 570 字族，用於校正詞性衍生家族 | — |

- 釋義原為簡體，建置時以 `opencc-js` 轉為**台灣繁體**（`网络→網路`、`软件→軟體`）
- Tier 1–10 依 BNC/COCA 詞頻十等分，Tier 1 最高頻
- 帶 `zk`（國中）標籤的字一律排除。ECDICT 會把 `can` 標成 toefl、把 `in`/`on`/`go` 標成 ielts，
  只看考試標籤篩不掉它們，而它們的詞頻最高、會直接佔滿 Tier 1——那是灌水不是詞彙量
- 分 10 個區塊延遲載入（各約 400 KB），首屏只載 Tier 1–3

### 詞性衍生家族的取捨

「舉一反三」只在**有依據**時才顯示家族，兩種來源：

1. Coxhead AWL 明列的成員（843 字）
2. 詞幹相同**且**字根相同（248 字）

單靠詞幹相同會產生自信的錯誤——它會把 `empirical` 配成 `empire`（希臘 empeiria vs 拉丁 imperium），把 `create` 配成 `creature` 而非 `creation`。**1,513 組**未經佐證的詞幹群組因此被丟棄。拿去準備考試的內容，教錯比沒教更糟。

其餘單字的家族由 AI 即時生成（需 API key），或退回顯示該字真實的詞形變化。

## 架構

```
src/data/vocabularyLoader.ts   讀 public/data/*.json → TOEFLWord
src/utils/srsEngine.ts         SRS 排程與本機進度
src/components/                6 個分頁與 Modal
api/_lib/gemini.ts             AI handler（dev 與正式環境共用）
api/ai/[action].ts             Vercel serverless 路由
server.ts                      本機開發伺服器，掛載同一份 handler
scripts/build-dataset.mjs      ECDICT → 分層 JSON
scripts/enrich.mjs             詞性衍生家族 + 字根歸屬
```

## 部署

推上 GitHub 後在 Vercel 匯入即可，是純靜態站 + serverless functions，`vercel.json` 已設好。

**AI 擴充是選配。** 不設金鑰時，12,499 字詞庫、SRS、闖關、閱讀、診斷全部正常運作，且完全離線可用；AI 端點會回 503 並附說明。要開啟就在 Vercel 專案設定加環境變數：

```
GEMINI_API_KEY=<你的金鑰>
```

金鑰只在 server 端讀取，永遠不會進入前端 bundle 或這個 repo。

## 已修正的問題

從 AI Studio 原型移植時修掉的：

- **詞庫只有 33 字**：介面宣稱 10,000+，實際內建 33 字，其餘全靠 AI 即時生成（要網路、要花錢、內容未校對）。改為內建 12,499 字。
- **UTC 換日錯誤**：`toISOString()` 會把換日點移到 UTC，UTC+8 使用者每天前 8 小時都會被判定為前一天，連續天數與複習排程因此失準。改用本地日曆日。
- **14,000 個 DOM 按鈕**：關卡頁為每個單字渲染按鈕，舉一反三頁渲染 208,000 個節點，手機上直接凍結。改為預覽 12 個 + 分頁載入，節點數降到 621 / 1,021。
- **點擊目標過小**：26–40px 的控制項低於 Apple HIG 與 WCAG 2.5.5 的 44px 下限，`src/index.css` 統一設下限。
- **320px 版面溢出**：底部 6 個分頁固定 64px 需要 384px；標題與按鈕缺 `min-w-0` 導致撐破容器。
- **釋義雜訊**：`[計] 永久的` 這類領域標籤、重複義項與過長列舉，在四選一選項中難以閱讀。
