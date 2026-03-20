import { describe, expect, it } from "vitest";

import type { GeneratedAsset } from "@/types/asset";

import { computeActivity, computeStats } from "../assets";

function makeAsset(overrides: Partial<GeneratedAsset> = {}): GeneratedAsset {
  return {
    id: "1",
    name: "test",
    type: "image",
    model: "gpt-image-1",
    prompt: "test prompt",
    settings: {},
    storagePath: "user/project/1.png",
    mimeType: "image/png",
    createdAt: Date.now(),
    ...overrides,
  };
}

describe("computeStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeStats([]);
    expect(stats).toEqual({ total: 0, images: 0, sounds: 0, storageMb: 0 });
  });

  it("counts images and sounds separately", () => {
    const assets = [
      makeAsset({ type: "image" }),
      makeAsset({ type: "image" }),
      makeAsset({ type: "sound" }),
    ];
    const stats = computeStats(assets);
    expect(stats.total).toBe(3);
    expect(stats.images).toBe(2);
    expect(stats.sounds).toBe(1);
  });

  it("always returns storageMb as 0 (server-side tracked)", () => {
    const stats = computeStats([makeAsset()]);
    expect(stats.storageMb).toBe(0);
  });
});

describe("computeActivity", () => {
  it("returns the correct number of days", () => {
    const activity = computeActivity([], 7);
    expect(activity).toHaveLength(7);
  });

  it("returns dates in ascending order", () => {
    const activity = computeActivity([], 3);
    const dates = activity.map((a) => a.date);
    expect(dates).toEqual([...dates].sort());
  });

  it("initializes all counts to zero", () => {
    const activity = computeActivity([], 5);
    for (const day of activity) {
      expect(day.images).toBe(0);
      expect(day.sounds).toBe(0);
    }
  });

  it("counts assets on the correct day", () => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const assets = [
      makeAsset({ type: "image", createdAt: today.getTime() }),
      makeAsset({ type: "sound", createdAt: today.getTime() }),
      makeAsset({ type: "image", createdAt: today.getTime() }),
    ];

    const activity = computeActivity(assets, 7);
    const todayEntry = activity.find((a) => a.date === todayStr)!;

    expect(todayEntry.images).toBe(2);
    expect(todayEntry.sounds).toBe(1);
  });

  it("ignores assets outside the date range", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 30);

    const assets = [makeAsset({ createdAt: oldDate.getTime() })];
    const activity = computeActivity(assets, 7);

    const total = activity.reduce((sum, day) => sum + day.images + day.sounds, 0);
    expect(total).toBe(0);
  });
});
