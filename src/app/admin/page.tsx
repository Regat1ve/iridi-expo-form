import { headers } from "next/headers";
import { isAdmin, listLeads } from "@/lib/db";
import { COLUMNS } from "@/lib/columns";

export const dynamic = "force-dynamic";

export default async function Admin({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  if (typeof key !== "string" || !isAdmin(key))
    return <p className="p-8 text-lg">Нет доступа. Откройте ссылку с ключом: /admin?key=…</p>;

  const leads = await listLeads();
  const host = (await headers()).get("host");
  const csvUrl = `https://${host}/api/export?format=csv&key=${encodeURIComponent(key)}`;

  return (
    <main className="mx-auto w-full max-w-[1400px] p-6">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-bold">Контакты с выставки: {leads.length}</h1>
        <a
          href={`/api/export?format=xlsx&key=${encodeURIComponent(key)}`}
          className="rounded-lg bg-[#e30613] px-5 py-3 font-semibold text-white"
        >
          Скачать Excel
        </a>
      </div>

      <details className="mb-6 rounded-lg border border-neutral-300 p-4">
        <summary className="cursor-pointer font-semibold">Живая Google Таблица</summary>
        <p className="mt-2">
          Создайте Google Таблицу и вставьте в ячейку A1 формулу. Таблица сама подтягивает новые
          анкеты (Google обновляет данные примерно раз в час).
        </p>
        <code className="mt-2 block break-all rounded bg-neutral-100 p-3 text-sm text-neutral-900">
          =IMPORTDATA(&quot;{csvUrl}&quot;)
        </code>
      </details>

      <div className="overflow-x-auto rounded-lg border border-neutral-300">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 text-neutral-900">
            <tr>
              {COLUMNS.map(([h]) => (
                <th key={h} className="whitespace-nowrap px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-neutral-200 align-top">
                {COLUMNS.map(([h, f]) => (
                  <td key={h} className="px-3 py-2">{f(l)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
