import * as React from "react";

import { supabase } from "@/lib/supabase";
import { saveAsset, uploadAssetFile } from "@/services/supabase/assets";
import { generateSoundViaEdge } from "@/services/supabase/generate-sound";
import type { GeneratedAsset } from "@/types/asset";
import {
  DEFAULT_SOUND_OPTIONS,
  type SoundGenerationOptions,
  type SoundGenerationResult,
  type SoundVoice,
} from "@/types/generation";

interface UseSoundGenerationProps {
  projectId?: string;
}

const FORMAT_MIME: Record<string, string> = {
  mp3: "audio/mpeg",
  opus: "audio/opus",
  aac: "audio/aac",
  flac: "audio/flac",
  wav: "audio/wav",
  pcm: "audio/L16",
};

export function useSoundGeneration({ projectId }: UseSoundGenerationProps = {}) {
  const [options, setOptions] =
    React.useState<SoundGenerationOptions>(DEFAULT_SOUND_OPTIONS);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<SoundGenerationResult | null>(null);

  function setOption<K extends keyof SoundGenerationOptions>(
    key: K,
    value: SoundGenerationOptions[K],
  ) {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  function setVoice(voice: SoundVoice) {
    setOptions((prev) => ({ ...prev, voice }));
  }

  function reset() {
    setResult(null);
    setError("");
  }

  async function generate(name: string, input: string): Promise<GeneratedAsset | null> {
    if (!input.trim()) return null;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { b64, format: fmt } = await generateSoundViaEdge(input, options);
      setResult({ b64, format: fmt, name, input });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const assetId = crypto.randomUUID();
      const mimeType = FORMAT_MIME[fmt] ?? "audio/mpeg";
      const storagePath = await uploadAssetFile(
        user.id,
        projectId ?? "",
        assetId,
        b64,
        mimeType,
        fmt,
      );

      const asset: GeneratedAsset = {
        id: assetId,
        name,
        type: "sound",
        model: options.model,
        prompt: input,
        settings: {
          voice: options.voice,
          speed: options.speed,
          format: options.format,
          instructions: options.instructions,
        },
        storagePath,
        mimeType,
        createdAt: Date.now(),
      };
      await saveAsset(asset, projectId ?? "");
      return asset;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    options,
    setOption,
    setVoice,
    loading,
    error,
    result,
    generate,
    reset,
  };
}
