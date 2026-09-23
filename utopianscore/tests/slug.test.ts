import { describe, expect, it } from "vitest";
import { slugify } from "@/domain/slug";

describe("slugify", () => {
  it("lowercases and hyphenates a normal title", () => {
    expect(slugify("Python Foundations")).toBe("python-foundations");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("C++ & Data Structures!!")).toBe("c-data-structures");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Intro to Web--  ")).toBe("intro-to-web");
  });

  it("handles already-clean input unchanged", () => {
    expect(slugify("web-fundamentals")).toBe("web-fundamentals");
  });
});
