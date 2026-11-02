import { describe, expect, it } from "vitest";
import { formatCreatedAt } from "./format";

describe("formatCreatedAt", () => {
  it("formats timestamp into localized date and time string", () => {
    const timestamp = new Date(2026, 10, 1, 15, 30).getTime();
    const formatted = formatCreatedAt(timestamp).replace(/\s/g, " ");

    expect(formatted).toContain("Nov 1, 2026");
    expect(formatted).toMatch(/3:30\s*PM/);
  });
});
