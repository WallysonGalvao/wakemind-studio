// supabase/functions/_shared/rate-limit.ts
// Shared rate-limit helper for generation Edge Functions.
// Uses the service role client to call check_generation_rate_limit RPC.

import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Check rate limit for a generation request.
 * Returns a 429 Response if rate-limited, or null if allowed.
 * Fail-closed: if the check itself errors, a 503 is returned.
 */
export async function checkRateLimit(
  userId: string,
  functionName: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data, error } = await serviceClient.rpc("check_generation_rate_limit", {
    p_user_id: userId,
    p_function_name: functionName,
  });

  if (error) {
    // Fail-closed: reject the request if rate limit check fails
    console.error("Rate limit check failed:", error.message);
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable. Please try again later.",
        code: "RATE_LIMIT_UNAVAILABLE",
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": "30",
        },
      },
    );
  }

  const result = data as {
    allowed: boolean;
    reason?: string;
    retry_after?: number;
  };

  if (!result.allowed) {
    const message =
      result.reason === "minute_limit"
        ? "Too many requests. Please wait a moment before generating again."
        : "Daily generation limit reached. Try again tomorrow.";

    return new Response(
      JSON.stringify({
        error: message,
        code: "RATE_LIMITED",
        reason: result.reason,
        retry_after: result.retry_after,
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(result.retry_after ?? 60),
        },
      },
    );
  }

  return null;
}
