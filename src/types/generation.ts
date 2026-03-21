export interface GenerationOptions {
  model: string;
  size: string;
  quality: "standard" | "hd";
  format: string;
  background: string;
}

export interface GenerationResult {
  b64: string;
  format: string;
  prompt: string;
  name: string;
}

export const DEFAULT_GENERATION_OPTIONS: GenerationOptions = {
  model: "gpt-image-1",
  size: "1024x1024",
  quality: "standard",
  format: "png",
  background: "transparent",
};

// ── Sound generation types ────────────────────────────────────────────────────

export type SoundVoice =
  | "alloy"
  | "ash"
  | "coral"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "sage"
  | "shimmer";

export interface SoundGenerationOptions {
  model: string;
  voice: SoundVoice;
  speed: number;
  format: string;
  instructions?: string;
}

export interface SoundGenerationResult {
  b64: string;
  format: string;
  name: string;
  input: string;
}

export const DEFAULT_SOUND_OPTIONS: SoundGenerationOptions = {
  model: "gpt-4o-mini-tts",
  voice: "alloy",
  speed: 1.0,
  format: "mp3",
};
