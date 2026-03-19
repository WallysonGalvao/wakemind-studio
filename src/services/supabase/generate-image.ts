import { supabase } from "@/lib/supabase";
import type { GenerationOptions } from "@/types/generation";

export async function generateImageViaEdge(
  prompt: string,
  options: GenerationOptions,
): Promise<{ b64: string; format: string }> {
  const { data, error } = await supabase.functions.invoke<{
    b64: string;
    format: string;
  }>("generate-image", {
    body: { prompt, options },
  });

  if (error) throw new Error(error.message);
  if (!data?.b64) throw new Error("No image data returned from Edge Function");

  return { b64: data.b64, format: data.format };
}
