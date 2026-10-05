import ExcelJS from "exceljs";
import { isAdmin, listLeads } from "@/lib/db";
import { COLUMNS } from "@/lib/columns";

export const dynamic = "force-dynamic";

// ?format=xlsx — download for Excel; ?format=csv — live feed for Google Sheets IMPORTDATA.
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!isAdmin(url.searchParams.get("key"))) return new Response("Forbidden", { status: 403 });

  const rows = (await listLeads()).map((l) => COLUMNS.map(([, f]) => f(l)));
  const header = COLUMNS.map(([h]) => h);

  if (url.searchParams.get("format") === "csv") {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Контакты", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.addRow(header).font = { bold: true };
  ws.addRows(rows);
  ws.columns.forEach((c) => (c.width = 28));
  ws.autoFilter = { from: "A1", to: { row: 1, column: header.length } };

  const name = `iridi-expo-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return new Response(await wb.xlsx.writeBuffer(), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
