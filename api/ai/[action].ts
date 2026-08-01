import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runAction, AI_ACTIONS, BadRequest, MissingKeyError, UpstreamError, type AIAction } from '../../lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: '只接受 POST' });
  }

  const raw = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;
  if (!raw || !AI_ACTIONS.includes(raw as AIAction)) {
    return res.status(404).json({ error: `未知的 AI 動作：${raw}` });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    return res.status(200).json(await runAction(raw as AIAction, body));
  } catch (err) {
    if (err instanceof MissingKeyError) {
      /* Not an error the learner caused — the app is fully usable without it. */
      return res.status(503).json({
        error: 'AI 擴充功能未啟用',
        hint: '這是選配功能。內建的 14,131 字詞庫不需要它也能完整使用；若要開啟，請在 Vercel 專案設定新增 GEMINI_API_KEY 環境變數。',
      });
    }
    if (err instanceof BadRequest) {
      return res.status(400).json({ error: (err as Error).message });
    }
    if (err instanceof UpstreamError) {
      return res.status(502).json({ error: (err as Error).message });
    }
    console.error(`AI action "${raw}" failed:`, err);
    return res.status(502).json({
      error: 'AI 服務暫時無法回應，請稍後再試。',
      details: (err as Error).message,
    });
  }
}
