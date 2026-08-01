// probe: imports the shared lib from api/_lib
import { AI_ACTIONS } from './_lib/gemini';
export default function handler(_req: any, res: any) {
  res.status(200).json({ probe: 'b', actions: AI_ACTIONS.length });
}
