import { describe, it, expect } from "vitest";
import { calcAge, carryForward, formatDate } from "./clinical";

describe("clinical helpers", () => {
  it("calculates age before and after birthday", () => {
    expect(calcAge("1980-06-15", new Date(2026, 5, 14))).toBe(45);
    expect(calcAge("1980-06-15", new Date(2026, 5, 15))).toBe(46);
  });
  it("returns null without birth date", () => {
    expect(calcAge(null)).toBeNull();
  });
  it("formats ISO dates as dd/mm/yyyy", () => {
    expect(formatDate("2026-10-27")).toBe("27/10/2026");
  });
  it("first session is 'Primera vez', following sessions default to 'Seguimiento'", () => {
    expect(carryForward(undefined).encounter_type).toBe("Primera vez");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prev = { objectives: "Mejorar disnea", services: ["Terapia física"] } as any;
    const next = carryForward(prev);
    expect(next.encounter_type).toBe("Seguimiento");
    expect(next.objectives).toBe("Mejorar disnea");
  });
});
