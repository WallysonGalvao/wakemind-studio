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
