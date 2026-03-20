import type { SoundGenerationOptions, SoundVoice } from "@/types/generation";

export interface SoundPreset {
  id: string;
  name: string;
  description: string;
  voice: SoundVoice;
  speed: number;
  instructions: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: "narrator",
    name: "Narrator",
    description: "Calm, clear narration for tutorials and lore",
    voice: "onyx",
    speed: 1.0,
    instructions:
      "Speak in a warm, authoritative tone like a nature documentary narrator. Clear enunciation, measured pacing, slight dramatic pauses between sentences.",
  },
  {
    id: "npc-friendly",
    name: "Friendly NPC",
    description: "Cheerful character dialogue for quest givers",
    voice: "nova",
    speed: 1.1,
    instructions:
      "Speak in a cheerful, welcoming tone like a friendly shopkeeper in a fantasy RPG. Warm and enthusiastic, slightly playful.",
  },
  {
    id: "npc-mysterious",
    name: "Mysterious NPC",
    description: "Enigmatic character voice for sages and mystics",
    voice: "fable",
    speed: 0.9,
    instructions:
      "Speak in a hushed, mysterious tone like an ancient sage sharing forbidden knowledge. Slow, deliberate, with dramatic pauses and an air of secrecy.",
  },
  {
    id: "announcer",
    name: "Announcer",
    description: "Bold, energetic voice for achievements and rewards",
    voice: "echo",
    speed: 1.0,
    instructions:
      "Speak in an epic, triumphant announcer voice. Bold, energetic, and celebratory — like announcing a championship victory. Clear and impactful.",
  },
  {
    id: "8bit-character",
    name: "8-bit Character",
    description: "Quirky retro voice for pixel-art style games",
    voice: "shimmer",
    speed: 1.3,
    instructions:
      "Speak in a high-pitched, energetic, slightly robotic tone reminiscent of classic video game characters. Quick, punchy sentences. Enthusiastic and playful.",
  },
  {
    id: "villain",
    name: "Villain",
    description: "Menacing voice for antagonist dialogue",
    voice: "ash",
    speed: 0.85,
    instructions:
      "Speak in a dark, menacing, and confident tone like a classic video game villain. Deep, deliberate, slightly theatrical with an undertone of danger.",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Configure your own voice and instructions",
    voice: "alloy",
    speed: 1.0,
    instructions: "",
  },
];

export function applyPreset(
  preset: SoundPreset,
  current: SoundGenerationOptions,
): SoundGenerationOptions {
  return {
    ...current,
    voice: preset.voice,
    speed: preset.speed,
    instructions: preset.instructions,
  };
}
