import { parseLead } from "@/lib/form";
import { saveLead } from "@/lib/db";

export async function POST(req: Request) {
  const lead = parseLead(await req.json().catch(() => null));
  if (typeof lead === "string") return Response.json({ error: lead }, { status: 400 });
  await saveLead(lead);
  return Response.json({ ok: true });
}
