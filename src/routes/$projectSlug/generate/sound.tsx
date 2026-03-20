import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, Music, Volume2, Wand2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from "@/hooks/use-project";
import { useSoundGeneration } from "@/hooks/use-sound-generation";
import { SOUND_PRESETS } from "@/lib/library/sound/presets";
import type { SoundVoice } from "@/types/generation";

export const Route = createFileRoute("/$projectSlug/generate/sound")({
  component: GenerateSoundPage,
});

const VOICES: SoundVoice[] = [
  "alloy",
  "ash",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
];

const FORMAT_MIME: Record<string, string> = {
  mp3: "audio/mpeg",
  opus: "audio/opus",
  aac: "audio/aac",
  flac: "audio/flac",
  wav: "audio/wav",
};

function GenerateSoundPage() {
  const project = useProject();
  const gen = useSoundGeneration({ projectId: project.id });

  const [name, setName] = React.useState("");
  const [input, setInput] = React.useState("");
  const [presetId, setPresetId] = React.useState("");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function handlePresetChange(id: string) {
    setPresetId(id);
    const preset = SOUND_PRESETS.find((p) => p.id === id);
    if (preset) {
      gen.setOption("voice", preset.voice);
      gen.setOption("speed", preset.speed);
      gen.setOption("instructions", preset.instructions);
    }
  }

  function handleVoiceChange(voice: string) {
    gen.setVoice(voice as SoundVoice);
  }

  function handleModelChange(model: string) {
    gen.setOption("model", model);
  }

  function handleFormatChange(format: string) {
    gen.setOption("format", format);
  }

  function handleSpeedChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) gen.setOption("speed", val);
  }

  function handleInstructionsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    gen.setOption("instructions", e.target.value);
  }

  async function handleGenerate() {
    if (!name.trim() || !input.trim()) return;
    await gen.generate(name.trim(), input.trim());
  }

  function handleDownload() {
    if (!gen.result) return;
    const mime = FORMAT_MIME[gen.result.format] ?? "audio/mpeg";
    const a = document.createElement("a");
    a.href = `data:${mime};base64,${gen.result.b64}`;
    a.download = `${gen.result.name.toLowerCase().replace(/\s+/g, "_")}.${gen.result.format}`;
    a.click();
  }

  const audioSrc = gen.result
    ? `data:${FORMAT_MIME[gen.result.format] ?? "audio/mpeg"};base64,${gen.result.b64}`
    : null;

  const isCustomPreset = presetId === "custom";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generate Sound</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate voice and audio assets using the OpenAI TTS API.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ── Left column: form ── */}
        <div className="flex flex-col gap-4">
          {/* Asset info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Music className="size-4" />
                Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="preset">Preset</Label>
                <Select value={presetId} onValueChange={handlePresetChange}>
                  <SelectTrigger id="preset">
                    <SelectValue placeholder="Select a voice preset…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUND_PRESETS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span>{p.name}</span>
                        <span className="ml-2 text-muted-foreground">
                          — {p.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Quest Accepted, Victory Fanfare"
                  value={name}
                  onChange={handleNameChange}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="input">Text to speak *</Label>
                <textarea
                  id="input"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. Quest accepted! Seek the ancient artifact in the Crystal Caverns."
                  value={input}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generation options */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Generation Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Model</Label>
                <Select value={gen.options.model} onValueChange={handleModelChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini-tts">gpt-4o-mini-tts</SelectItem>
                    <SelectItem value="tts-1">tts-1</SelectItem>
                    <SelectItem value="tts-1-hd">tts-1-hd</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs">Voice</Label>
                <Select value={gen.options.voice} onValueChange={handleVoiceChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs">Format</Label>
                <Select value={gen.options.format} onValueChange={handleFormatChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="opus">Opus</SelectItem>
                    <SelectItem value="aac">AAC</SelectItem>
                    <SelectItem value="flac">FLAC</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs">Speed ({gen.options.speed}x)</Label>
                <input
                  type="range"
                  min="0.25"
                  max="4.0"
                  step="0.05"
                  value={gen.options.speed}
                  onChange={handleSpeedChange}
                  className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Instructions (visible for gpt-4o-mini-tts or custom preset) */}
          {(gen.options.model === "gpt-4o-mini-tts" || isCustomPreset) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Voice Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe tone, emotion, pacing… e.g. Speak in a warm, mysterious tone with dramatic pauses."
                  value={gen.options.instructions ?? ""}
                  onChange={handleInstructionsChange}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Only supported by gpt-4o-mini-tts. Controls tone, emotion, and style.
                </p>
              </CardContent>
            </Card>
          )}

          {gen.error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive dark:border-red-900 dark:bg-red-950/30">
              {gen.error}
            </p>
          )}

          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={gen.loading || !name.trim() || !input.trim()}
            className="w-full"
          >
            {gen.loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 size-4" />
                Generate Sound
              </>
            )}
          </Button>
        </div>

        {/* ── Right column: preview ── */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-0 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-muted/50">
                {gen.loading && (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Generating audio…</p>
                  </div>
                )}
                {audioSrc && !gen.loading && (
                  <div className="flex flex-col items-center gap-4 px-4">
                    <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                      <Volume2 className="size-10 text-primary" />
                    </div>
                    <p className="text-center text-sm font-medium">{gen.result?.name}</p>
                    <audio controls src={audioSrc} className="w-full">
                      <track kind="captions" />
                    </audio>
                  </div>
                )}
                {!audioSrc && !gen.loading && (
                  <div className="flex flex-col items-center gap-2">
                    <Volume2 className="size-12 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">
                      Your audio will appear here
                    </p>
                  </div>
                )}
              </div>

              {gen.result && (
                <Button variant="outline" className="w-full" onClick={handleDownload}>
                  <Download className="mr-2 size-4" />
                  Download .{gen.result.format}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
