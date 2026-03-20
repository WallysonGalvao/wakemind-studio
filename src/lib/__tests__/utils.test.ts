import { describe, expect, it } from "vitest";

import { cn, formatDate } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isHidden = false;
    expect(cn("base", isHidden && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a timestamp into a readable date string", () => {
    // Use a local midnight to avoid timezone shifts
    const ts = new Date(2024, 0, 15).getTime();
    const result = formatDate(ts);
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("returns a string containing month, day and year", () => {
    const ts = new Date(2023, 5, 1).getTime();
    const result = formatDate(ts);
    expect(result).toContain("2023");
    expect(result).toContain("1");
  });
});
