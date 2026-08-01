import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAIEnabled } from './_lib/gemini';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    /* Lets the UI show whether on-demand AI expansion is available without
       exposing anything about the key itself. */
    aiEnabled: isAIEnabled(),
    timestamp: new Date().toISOString(),
  });
}
