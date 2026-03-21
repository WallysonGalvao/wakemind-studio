import * as React from "react";

import { buildPrompt, type StyleConfig } from "@/lib/library/image/styles";
import { supabase } from "@/lib/supabase";
import { saveAsset, uploadAssetFile } from "@/services/supabase/assets";
import { generateImageViaEdge } from "@/services/supabase/generate-image";
import type { GeneratedAsset } from "@/types/asset";
import {
  DEFAULT_GENERATION_OPTIONS,
  type GenerationOptions,
  type GenerationResult,
} from "@/types/generation";

interface UseGenerationProps {
  initialStyleConfig?: Record<string, unknown>;
  projectId?: string;
}

export function useGeneration({
  initialStyleConfig,
  projectId,
}: UseGenerationProps = {}) {
  const [options, setOptions] = React.useState<GenerationOptions>(
    DEFAULT_GENERATION_OPTIONS,
  );
  const [styleJson, setStyleJson] = React.useState(() =>
    initialStyleConfig ? JSON.stringify(initialStyleConfig, null, 2) : "",
  );
  const [styleError, setStyleError] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<GenerationResult | null>(null);

  function setOption<K extends keyof GenerationOptions>(
    key: K,
    value: GenerationOptions[K],
  ) {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  function loadStyleConfig(config: Record<string, unknown>) {
    setStyleJson(JSON.stringify(config, null, 2));
    setStyleError("");
  }

  function parseStyleConfig(): StyleConfig | null {
    try {
      const parsed = JSON.parse(styleJson);
      setStyleError("");
      return parsed as StyleConfig;
    } catch {
      setStyleError("Invalid JSON in style config");
      return null;
    }
  }

  function reset() {
    setResult(null);
    setError("");
  }

  async function generate(
    name: string,
    packageId?: string,
  ): Promise<GeneratedAsset | null> {
    const styleConfig = parseStyleConfig();
    if (!styleConfig) return null;

    const prompt = buildPrompt(styleConfig, name, description.trim() || undefined);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { b64, format: fmt } = await generateImageViaEdge(prompt, options, projectId);
      setResult({ b64, format: fmt, prompt, name });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const assetId = crypto.randomUUID();
      const mimeType = `image/${fmt}`;
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
        type: "image",
        packageId,
        model: options.model,
        prompt,
        settings: {
          size: options.size,
          quality: options.quality,
          format: options.format,
          background: options.background,
        },
        storagePath,
        imageUrl: `data:${mimeType};base64,${b64}`, // immediate preview
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
    // State
    options,
    styleJson,
    styleError,
    description,
    loading,
    error,
    result,
    // Actions
    setOption,
    setStyleJson: (v: string) => {
      setStyleJson(v);
      setStyleError("");
    },
    setDescription,
    loadStyleConfig,
    reset,
    generate,
  };
}
