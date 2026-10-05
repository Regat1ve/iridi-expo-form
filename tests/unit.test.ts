import { describe, expect, it } from "vitest";
import { INTENTS, INTERESTS, LANGS, isHot, parseLead } from "../src/lib/form";
import { DICT } from "../src/lib/i18n";

const base = {
  id: "11111111-2222-4333-8444-555555555555",
  filledAt: "2026-10-05T10:00:00Z",
  name: "Иван",
  phone: "+79990000000",
};

describe("parseLead", () => {
  it("accepts a valid lead and keeps only known options", () => {
    const l = parseLead({ ...base, roles: ["интегратор", "хакер"], lang: "de" });
    expect(l).toMatchObject({ roles: ["интегратор"], lang: "de" });
  });

  it("requires a name and at least one contact", () => {
    expect(parseLead({ ...base, name: "  " })).toBe("Укажите имя");
    expect(parseLead({ ...base, phone: "" })).toBe("Укажите телефон или email");
    expect(parseLead({ ...base, phone: "", email: "a@b.ru" })).not.toBeTypeOf("string");
  });

  it("rejects a bad id and garbage bodies", () => {
    expect(parseLead({ ...base, id: "1; DROP TABLE" })).toBe("Некорректный id");
    expect(parseLead(null)).toBe("Некорректный id");
  });

  it("trims and caps long strings, falls back on unknown lang", () => {
    const l = parseLead({ ...base, name: `  ${"я".repeat(500)}  `, lang: "fr" });
    if (typeof l === "string") throw new Error(l);
    expect(l.name).toHaveLength(200);
    expect(l.lang).toBe("ru");
  });
});

describe("isHot", () => {
  it("flags people who already want something", () => {
    expect(isHot({ interests: [], intents: [INTENTS[0]] })).toBe(true);
    expect(isHot({ interests: [INTERESTS[4]], intents: [] })).toBe(true);
    expect(isHot({ interests: [INTERESTS[5]], intents: [] })).toBe(true);
  });

  it("does not flag the curious", () => {
    expect(isHot({ interests: [INTERESTS[0]], intents: [INTENTS[1], INTENTS[2]] })).toBe(false);
  });
});

describe("translations", () => {
  // Labels are matched to stored values by index; a missing line would save the wrong answer.
  it.each(LANGS)("%s has every question and option", (lang) => {
    const t = DICT[lang];
    for (const k of ["q", "roles", "interests", "directions", "intents"] as const) {
      expect(t[k]).toHaveLength(DICT.ru[k].length);
      t[k].forEach((v) => expect(v.trim()).not.toBe(""));
    }
  });
});
