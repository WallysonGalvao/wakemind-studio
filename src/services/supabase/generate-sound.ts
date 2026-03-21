import { supabase } from "@/lib/supabase";
import type { SoundGenerationOptions } from "@/types/generation";

export async function generateSoundViaEdge(
  input: string,
  options: SoundGenerationOptions,
  projectId?: string,
): Promise<{ b64: string; format: string }> {
  const { data, error } = await supabase.functions.invoke<{
    b64: string;
    format: string;
  }>("generate-sound", {
    body: { input, options, projectId },
  });

  if (error) throw new Error(error.message);
  if (!data?.b64) throw new Error("No audio data returned from Edge Function");

  return { b64: data.b64, format: data.format };
}
