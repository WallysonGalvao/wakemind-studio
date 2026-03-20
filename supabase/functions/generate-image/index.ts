// supabase/functions/generate-image/index.ts
// Deno runtime — deploy with: supabase functions deploy generate-image
// Set the secret: supabase secrets set OPENAI_API_KEY=sk-...

import { createClient } from "jsr:@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth: verify JWT ─────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Rate limit ───────────────────────────────────────────────────────
    const rateLimitResponse = await checkRateLimit(
      user.id,
      "generate-image",
      corsHeaders,
    );
    if (rateLimitResponse) return rateLimitResponse;

    // ── Parse request ────────────────────────────────────────────────────────
    const { prompt, options } = (await req.json()) as {
      prompt: string;
      options: {
        model: string;
        size: string;
        quality: string;
        format: string;
        background: string;
      };
    };

    if (!prompt || !options) {
      return new Response(JSON.stringify({ error: "Missing prompt or options" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Call OpenAI ──────────────────────────────────────────────────────────
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY secret not set");

    const body: Record<string, unknown> = {
      model: options.model,
      prompt,
      n: 1,
      size: options.size,
    };

    if (options.model === "dall-e-3") {
      body.quality = options.quality;
    }

    if (options.model === "gpt-image-1") {
      body.output_format = options.format;
      if (options.background === "transparent") {
        body.background = "transparent";
      }
    }

    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return new Response(JSON.stringify({ error: `OpenAI error: ${errText}` }), {
        status: openaiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiData = (await openaiRes.json()) as {
      data: Array<{ b64_json?: string; url?: string }>;
    };

    const imageData = openaiData.data[0];
    let b64 = imageData.b64_json ?? "";

    // If URL returned, fetch and convert to b64
    if (!b64 && imageData.url) {
      const imgRes = await fetch(imageData.url);
      const arrayBuffer = await imgRes.arrayBuffer();
      b64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    }

    if (!b64) throw new Error("No image data received from OpenAI");

    return new Response(JSON.stringify({ b64, format: options.format }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
