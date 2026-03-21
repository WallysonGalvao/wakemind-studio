import { describe, expect, it } from "vitest";

import type { SoundGenerationOptions } from "@/types/generation";

import { applyPreset, SOUND_PRESETS } from "../sound/presets";

const BASE_OPTIONS: SoundGenerationOptions = {
  model: "gpt-4o-mini-tts",
  voice: "alloy",
  speed: 1.0,
  format: "mp3",
  instructions: "some existing instructions",
};

describe("SOUND_PRESETS", () => {
  it("has 7 presets", () => {
    expect(SOUND_PRESETS).toHaveLength(7);
  });

  it("each preset has required fields", () => {
    for (const preset of SOUND_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.voice).toBeTruthy();
      expect(typeof preset.speed).toBe("number");
    }
  });

  it("includes a custom preset with empty instructions", () => {
    const custom = SOUND_PRESETS.find((p) => p.id === "custom");
    expect(custom).toBeDefined();
    expect(custom!.instructions).toBe("");
  });
});

describe("applyPreset", () => {
  it("overrides voice, speed, and instructions from preset", () => {
    const narrator = SOUND_PRESETS.find((p) => p.id === "narrator")!;
    const result = applyPreset(narrator, BASE_OPTIONS);

    expect(result.voice).toBe("onyx");
    expect(result.speed).toBe(1.0);
    expect(result.instructions).toContain("documentary");
  });

  it("preserves model and format from current options", () => {
    const narrator = SOUND_PRESETS.find((p) => p.id === "narrator")!;
    const result = applyPreset(narrator, BASE_OPTIONS);

    expect(result.model).toBe("gpt-4o-mini-tts");
    expect(result.format).toBe("mp3");
  });

  it("does not mutate the original options", () => {
    const narrator = SOUND_PRESETS.find((p) => p.id === "narrator")!;
    const original = { ...BASE_OPTIONS };
    applyPreset(narrator, BASE_OPTIONS);

    expect(BASE_OPTIONS).toEqual(original);
  });
});
