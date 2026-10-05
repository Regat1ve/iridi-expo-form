// Questions mirror the paper form "Анкета для выставок" one-to-one.
export const ROLES = [
  "интегратор",
  "дизайнер, архитектор",
  "электрик, слаботочник",
  "застройщик, девелопер",
  "проектировщик",
  "частное лицо, смотрю для себя",
  "заказчик от юр. лица",
  "инженер по эксплуатации",
  "продавец УД, ЭУИ, инженерки",
];

export const INTERESTS = [
  "материалы о продуктах",
  "ищу себе инсталлятора",
  "обучающие курсы",
  "ищу вендора как инсталлятор",
  "хочу стать дистрибьютором",
  "договориться о презентации pre-sale менеджера",
];

export const DIRECTIONS = ["SmartHome", "Коммерция, AV", "МКД", "Отели", "BMS"];

export const INTENTS = [
  "Нужно КП, презентация, встреча или партнерство",
  "Будущие планы",
  "Смотрю, что есть на рынке",
];

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
  };
  if (!lead.name) return "Укажите имя";
  if (!lead.phone && !lead.email) return "Укажите телефон или email";
  return lead;
}
