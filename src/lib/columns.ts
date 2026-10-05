import type { Lead } from "./form";

const j = (a: string[]) => a.join("; ");
const date = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

// One definition feeds the admin table, Excel and CSV, so they never drift apart.
export const COLUMNS: [string, (l: Lead) => string][] = [
  ["Дата (МСК)", (l) => date(l.filledAt)],
  ["Имя", (l) => l.name],
  ["Компания", (l) => l.company],
  ["Кто вы", (l) => j(l.roleOther ? [...l.roles, `другое: ${l.roleOther}`] : l.roles)],
  ["Что интересует на стенде", (l) => j(l.interests)],
  ["Направления", (l) => j(l.directions)],
  ["Что интересует", (l) => j(l.intents)],
  ["Телефон", (l) => l.phone],
  ["Email", (l) => l.email],
  ["Выслать/сделать после выставки", (l) => l.followup],
];
