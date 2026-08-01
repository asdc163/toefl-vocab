/* Local development server.
 *
 * Production runs on Vercel, where /api/* is served by the serverless routes in
 * api/. This file exists so `npm run dev` behaves the same locally: it mounts
 * the very same handlers from api/_lib/gemini.ts, so there is one implementation
 * to keep correct rather than two.
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { runAction, AI_ACTIONS, BadRequest, MissingKeyError, UpstreamError, isAIEnabled, type AIAction } from './lib/gemini';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', aiEnabled: isAIEnabled(), timestamp: new Date().toISOString() });
  });

  app.post('/api/ai/:action', async (req, res) => {
    const action = req.params.action as AIAction;
    if (!AI_ACTIONS.includes(action)) {
      return res.status(404).json({ error: `未知的 AI 動作：${action}` });
    }
    try {
      res.json(await runAction(action, req.body || {}));
    } catch (err) {
      if (err instanceof MissingKeyError) {
        return res.status(503).json({
          error: 'AI 擴充功能未啟用',
          hint: '這是選配功能。內建詞庫不需要它也能完整使用；若要開啟，請在 .env 設定 GEMINI_API_KEY。',
        });
      }
      if (err instanceof BadRequest) return res.status(400).json({ error: (err as Error).message });
      if (err instanceof UpstreamError) return res.status(502).json({ error: (err as Error).message });
      console.error(`AI action "${action}" failed:`, err);
      res.status(502).json({ error: 'AI 服務暫時無法回應，請稍後再試。', details: (err as Error).message });
    }
  });

  if (isProd) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`\n  ▸ http://localhost:${PORT}`);
    console.log(`  ▸ 詞庫 ${dictionarySize()} 字`);
    console.log(`  ▸ AI 擴充：${isAIEnabled() ? '已啟用' : '未啟用（選配，不影響其他功能）'}\n`);
  });
}

function dictionarySize(): string {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'public/data/index.json'), 'utf8'),
    );
    return String(manifest.total);
  } catch {
    return '未建置（執行 npm run data:build）';
  }
}

startServer().catch((err) => {
  console.error('伺服器啟動失敗:', err);
  process.exit(1);
});
