import { DICT } from "./i18n";

// Questions mirror the paper form "Анкета для выставок" one-to-one; Russian values are what the DB stores.
export const { roles: ROLES, interests: INTERESTS, directions: DIRECTIONS, intents: INTENTS } = DICT.ru;

export const LANGS = ["ru", "en", "de", "zh"] as const;
export type Lang = (typeof LANGS)[number];

// "Already wants something" — sales calls these first. Mere curiosity is not hot.
// INTERESTS[4] = "хочу стать дистрибьютором", [5] = "договориться о презентации pre-sale менеджера".
const HOT = [INTENTS[0], INTERESTS[4], INTERESTS[5]];
export const isHot = (l: Pick<Lead, "interests" | "intents">) =>
  [...l.interests, ...l.intents].some((v) => HOT.includes(v));

export type Lead = {
  id: string;
  filledAt: string;
  name: string;
  company: string;
  roles: string[];
  roleOther: string;
  interests: string[];
  directions: string[];
  intents: string[];
  phone: string;
  email: string;
  followup: string;
  lang: Lang;
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pick = (v: unknown, allowed: string[]) =>
  Array.isArray(v) ? allowed.filter((o) => v.includes(o)) : [];

// Trust boundary: anything from the iPad goes through here before touching the DB.
export function parseLead(body: unknown): Lead | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const id = str(b.id, 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return "Некорректный id";
  const filled = new Date(str(b.filledAt, 40));
  const lead: Lead = {
    id,
    filledAt: isNaN(+filled) ? new Date().toISOString() : filled.toISOString(),
    name: str(b.name, 200),
    company: str(b.company, 200),
    roles: pick(b.roles, ROLES),
    roleOther: str(b.roleOther, 300),
    interests: pick(b.interests, INTERESTS),
    directions: pick(b.directions, DIRECTIONS),
    intents: pick(b.intents, INTENTS),
    phone: str(b.phone, 50),
    email: str(b.email, 200),
    followup: str(b.followup, 2000),
    lang: LANGS.find((x) => x === b.lang) ?? "ru",
  };
  if (!lead.name) return "Укажите имя";
  if (!lead.phone && !lead.email) return "Укажите телефон или email";
  return lead;
}
