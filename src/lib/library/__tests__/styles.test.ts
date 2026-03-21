import { describe, expect, it } from "vitest";

import { buildPrompt, DEFAULT_STYLE_CONFIG } from "../image/styles";

describe("buildPrompt", () => {
  it("includes the achievement name when no description is given", () => {
    const prompt = buildPrompt(DEFAULT_STYLE_CONFIG, "Fire Badge");
    expect(prompt).toContain("An icon for Fire Badge");
  });

  it("uses the description instead of the name when provided", () => {
    const prompt = buildPrompt(
      DEFAULT_STYLE_CONFIG,
      "Fire Badge",
      "A blazing flame icon",
    );
    expect(prompt).toContain("A blazing flame icon");
    expect(prompt).not.toContain("An icon for Fire Badge");
  });

  it("includes perspective and stylistic tone", () => {
    const prompt = buildPrompt(DEFAULT_STYLE_CONFIG, "Test");
    expect(prompt).toContain("soft isometric");
    expect(prompt).toContain("cozy");
  });

  it("includes transparent background directive", () => {
    const prompt = buildPrompt(DEFAULT_STYLE_CONFIG, "Test");
    expect(prompt).toContain("transparent background");
  });

  it("includes avoid constraints", () => {
    const prompt = buildPrompt(DEFAULT_STYLE_CONFIG, "Test");
    expect(prompt).toContain("avoid:");
    expect(prompt).toContain("photorealism");
  });

  it("returns a comma-separated string", () => {
    const prompt = buildPrompt(DEFAULT_STYLE_CONFIG, "Test");
    expect(prompt.split(", ").length).toBeGreaterThan(5);
  });
});
