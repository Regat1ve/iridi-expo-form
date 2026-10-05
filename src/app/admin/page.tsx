import { headers } from "next/headers";
import { isAdmin, listLeads } from "@/lib/db";
import { isHot } from "@/lib/form";
import { COLUMNS } from "@/lib/columns";

export const dynamic = "force-dynamic";

export default async function Admin({ searchParams }: { searchParams: Promise<{ key?: string; hot?: string }> }) {
  const { key, hot } = await searchParams;
  if (typeof key !== "string" || !isAdmin(key))
    return <p className="p-8 text-lg">Нет доступа. Откройте ссылку с ключом: /admin?key=…</p>;

  const all = await listLeads();
  const hotCount = all.filter(isHot).length;
  const leads = hot ? all.filter(isHot) : all;
  const host = (await headers()).get("host");
  const k = encodeURIComponent(key);
  const csvUrl = `https://${host}/api/export?format=csv&key=${k}`;
  const tab = "rounded-lg px-4 py-2 font-semibold";

  return (
    <main className="mx-auto w-full max-w-[1400px] p-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Контакты с выставки</h1>
        <a href="/qr" target="_blank" className={`${tab} border border-neutral-300`}>QR-код для стенда</a>
        <a href={`/api/export?format=xlsx&key=${k}`} className={`${tab} bg-[#e30613] text-white`}>Скачать Excel</a>
      </div>

      <nav className="mb-4 flex gap-2">
        <a href={`/admin?key=${k}`} className={`${tab} ${hot ? "bg-neutral-100" : "bg-neutral-900 text-white"}`}>
          Все: {all.length}
        </a>
        <a href={`/admin?key=${k}&hot=1`} className={`${tab} ${hot ? "bg-neutral-900 text-white" : "bg-red-50 text-red-800"}`}>
          Горячие: {hotCount}
        </a>
      </nav>

      <details className="mb-6 rounded-lg border border-neutral-300 p-4">
        <summary className="cursor-pointer font-semibold">Живая Google Таблица</summary>
        <p className="mt-2">
          Создайте Google Таблицу и вставьте в ячейку A1 формулу. Таблица сама подтягивает новые
          анкеты (Google обновляет данные примерно раз в час).
        </p>
        <code className="mt-2 block break-all rounded bg-neutral-100 p-3 text-sm">
          =IMPORTDATA(&quot;{csvUrl}&quot;)
        </code>
      </details>

      <div className="overflow-x-auto rounded-lg border border-neutral-300">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100">
            <tr>
              {COLUMNS.map(([h]) => (
                <th key={h} className="whitespace-nowrap px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} data-hot={isHot(l) || undefined} className="border-t border-neutral-200 align-top data-hot:bg-red-50">
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
