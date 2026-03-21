// supabase/functions/_shared/cors.ts
// Centralised CORS headers for all Edge Functions.
// In production only the GitHub Pages origin (and localhost for dev) are allowed.

const ALLOWED_ORIGINS: string[] = [
  "https://wallysongalvao.github.io",
  "http://localhost:3000",
];

/**
 * Build CORS headers for a given request.
 * If the request `Origin` is in the allow-list the response mirrors it back;
 * otherwise the first allowed origin is used (browsers will block the response).
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
