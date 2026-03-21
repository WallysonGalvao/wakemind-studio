// supabase/functions/generate-sound/index.ts
// Deno runtime — deploy with: supabase functions deploy generate-sound
// Uses the same OPENAI_API_KEY secret as generate-image

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
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

    // ── Rate limit ──────────────────────────────────────────────────────
    const rateLimitResponse = await checkRateLimit(
      user.id,
      "generate-sound",
      corsHeaders,
    );
    if (rateLimitResponse) return rateLimitResponse;

    // ── Parse & validate request ─────────────────────────────────────────────
    const { input, options } = (await req.json()) as {
      input: string;
      options: {
        model: string;
        voice: string;
        speed: number;
        format: string;
        instructions?: string;
      };
    };

    if (!input || !options) {
      return new Response(JSON.stringify({ error: "Missing input or options" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ALLOWED_MODELS = ["tts-1", "tts-1-hd", "gpt-4o-mini-tts"];
    const ALLOWED_VOICES = [
      "alloy",
      "ash",
      "ballad",
      "coral",
      "echo",
      "fable",
      "nova",
      "onyx",
      "sage",
      "shimmer",
    ];
    const ALLOWED_FORMATS = ["mp3", "opus", "aac", "flac", "wav"];
    const MAX_INPUT_LENGTH = 4096;
    const MAX_INSTRUCTIONS_LENGTH = 1000;
    const MIN_SPEED = 0.25;
    const MAX_SPEED = 4.0;

    if (input.length > MAX_INPUT_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!ALLOWED_MODELS.includes(options.model)) {
      return new Response(
        JSON.stringify({ error: `Invalid model. Allowed: ${ALLOWED_MODELS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!ALLOWED_VOICES.includes(options.voice)) {
      return new Response(
        JSON.stringify({ error: `Invalid voice. Allowed: ${ALLOWED_VOICES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!ALLOWED_FORMATS.includes(options.format)) {
      return new Response(
        JSON.stringify({
          error: `Invalid format. Allowed: ${ALLOWED_FORMATS.join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (
      typeof options.speed !== "number" ||
      options.speed < MIN_SPEED ||
      options.speed > MAX_SPEED
    ) {
      return new Response(
        JSON.stringify({
          error: `Speed must be a number between ${MIN_SPEED} and ${MAX_SPEED}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (options.instructions && options.instructions.length > MAX_INSTRUCTIONS_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `Instructions exceed maximum length of ${MAX_INSTRUCTIONS_LENGTH} characters`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Call OpenAI TTS ──────────────────────────────────────────────────
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY secret not set");

    const body: Record<string, unknown> = {
      model: options.model,
      input,
      voice: options.voice,
      response_format: options.format,
      speed: options.speed,
    };

    // gpt-4o-mini-tts supports instructions for tone/style
    if (options.model === "gpt-4o-mini-tts" && options.instructions) {
      body.instructions = options.instructions;
    }

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${errBody}`);
    }

    // Response is raw audio bytes — convert to base64
    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);

    return new Response(JSON.stringify({ b64, format: options.format }), {
      status: 200,
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
