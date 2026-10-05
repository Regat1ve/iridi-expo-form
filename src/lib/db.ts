import { neon } from "@neondatabase/serverless";
import type { Lead } from "./form";

export const sql = neon(process.env.DATABASE_URL!);

export async function saveLead(l: Lead) {
  // Client-generated id + DO NOTHING: offline retries from the iPad never create duplicates.
  await sql`
    INSERT INTO expo.leads (id, filled_at, name, company, roles, role_other, interests, directions, intents, phone, email, followup)
    VALUES (${l.id}, ${l.filledAt}, ${l.name}, ${l.company}, ${l.roles}, ${l.roleOther}, ${l.interests}, ${l.directions}, ${l.intents}, ${l.phone}, ${l.email}, ${l.followup})
    ON CONFLICT (id) DO NOTHING`;
}

export async function listLeads(): Promise<Lead[]> {
  const rows = await sql`SELECT * FROM expo.leads ORDER BY filled_at DESC`;
  return rows.map((r) => ({
    id: r.id,
    filledAt: new Date(r.filled_at).toISOString(),
    name: r.name,
    company: r.company,
    roles: r.roles,
    roleOther: r.role_other,
    interests: r.interests,
    directions: r.directions,
    intents: r.intents,
    phone: r.phone,
    email: r.email,
    followup: r.followup,
  }));
}

export const isAdmin = (key: string | null | undefined) =>
  !!process.env.ADMIN_KEY && key === process.env.ADMIN_KEY;
