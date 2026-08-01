/* Deliberately dependency-free.
 *
 * This route previously imported the shared Gemini lib just to read one env
 * var, which pulled the ESM-only @google/genai SDK into the bundle and took
 * the whole function down at load time. A health check must not be able to
 * fail because of an optional feature's SDK. */
export default function handler(_req: unknown, res: any) {
  res.status(200).json({
    status: 'ok',
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
}
