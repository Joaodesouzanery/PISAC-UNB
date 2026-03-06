import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber, formatPercentage, timeAgo, cn } from "@/lib/utils";

describe("Utils - formatCurrency", () => {
  it("should format numbers as Brazilian Real", () => {
    const result = formatCurrency(1500000);
    expect(result).toContain("1.500.000");
  });

  it("should handle zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("should handle decimals", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1.23");
  });
});

describe("Utils - formatNumber", () => {
  it("should format large numbers with dots", () => {
    const result = formatNumber(1000000);
    expect(result).toContain("1.000.000");
  });

  it("should handle small numbers", () => {
    const result = formatNumber(42);
    expect(result).toBe("42");
  });
});

describe("Utils - formatPercentage", () => {
  it("should format as percentage", () => {
    const result = formatPercentage(75.5);
    expect(result).toContain("75");
    expect(result).toContain("%");
  });
});

describe("Utils - timeAgo", () => {
  it("should return a string for recent dates", () => {
    const now = new Date().toISOString();
    const result = timeAgo(now);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should handle past dates", () => {
    const past = new Date(Date.now() - 3600000).toISOString();
    const result = timeAgo(past);
    expect(typeof result).toBe("string");
  });
});

describe("Utils - cn (class merge)", () => {
  it("should merge tailwind classes", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toBe("base extra");
  });

  it("should handle undefined values", () => {
    const result = cn("base", undefined, null, "extra");
    expect(result).toBe("base extra");
  });
});
