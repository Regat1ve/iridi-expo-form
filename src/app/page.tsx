"use client";

import { useCallback, useEffect, useState } from "react";
import { DIRECTIONS, INTENTS, INTERESTS, ROLES, type Lead } from "@/lib/form";

const QUEUE = "iridi-queue";
type Draft = Omit<Lead, "id" | "filledAt">;
type ListKey = "roles" | "interests" | "directions" | "intents";

const empty = (): Draft => ({
  name: "", company: "", roles: [], roleOther: "", interests: [],
  directions: [], intents: [], phone: "", email: "", followup: "",
});

// Every submitted form lands in localStorage first, so a dead exhibition Wi-Fi never loses a contact.
const readQueue = (): Lead[] => {
  try { return JSON.parse(localStorage.getItem(QUEUE) ?? "[]"); } catch { return []; }
};
const writeQueue = (q: Lead[]) => localStorage.setItem(QUEUE, JSON.stringify(q));

export default function Page() {
  const [d, setD] = useState<Draft>(empty);
  const [pending, setPending] = useState(0);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const flush = useCallback(async () => {
    for (const lead of readQueue()) {
      try {
        const r = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        });
        // 400 = the record itself is invalid, retrying won't help; anything else non-ok = keep for later.
        if (r.status === 400) console.error("rejected", lead, await r.text());
        if (r.ok || r.status === 400) writeQueue(readQueue().filter((x) => x.id !== lead.id));
      } catch {
        break; // offline, try again later
      }
    }
    setPending(readQueue().length);
  }, []);

  useEffect(() => {
    flush();
    navigator.serviceWorker?.register("/sw.js");
    const t = setInterval(flush, 15000);
    window.addEventListener("online", flush);
    return () => { clearInterval(t); window.removeEventListener("online", flush); };
  }, [flush]);

  const set = (k: keyof Draft, v: string) => setD({ ...d, [k]: v });
  const toggle = (k: ListKey, v: string) =>
    setD({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!d.phone.trim() && !d.email.trim())
      return setMsg({ text: "Укажите телефон или email", ok: false });
    writeQueue([...readQueue(), { ...d, id: crypto.randomUUID(), filledAt: new Date().toISOString() }]);
    setD(empty());
    setMsg({ text: `Анкета сохранена: ${d.name}`, ok: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    flush();
  }

  const box = (k: ListKey, options: string[]) =>
    options.map((o) => (
      <label key={o} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 active:bg-neutral-100">
        <input type="checkbox" className="size-7 shrink-0 accent-[#e30613]"
          checked={d[k].includes(o)} onChange={() => toggle(k, o)} />
        <span className="text-lg">{o}</span>
      </label>
    ));

  const input = "w-full rounded-lg border-2 border-neutral-300 px-4 py-3 text-xl focus:border-[#e30613] focus:outline-none";
  const h = "mb-3 mt-8 text-2xl font-bold";

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Анкета iRidi</h1>
        <span className={`rounded-full px-3 py-1 text-sm ${pending ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-900"}`}>
          {pending ? `Ждут отправки: ${pending}` : "Всё отправлено"}
        </span>
      </header>

      {msg && (
        <p className={`mt-4 rounded-lg p-4 text-lg ${msg.ok ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
          {msg.text}
        </p>
      )}

      <form onSubmit={submit} onChange={() => setMsg(null)}>
        <h2 className={h}>1. Имя *</h2>
        <input className={input} required value={d.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" />

        <h2 className={h}>2. Компания</h2>
        <input className={input} value={d.company} onChange={(e) => set("company", e.target.value)} autoComplete="off" />

        <h2 className={h}>3. Кто вы?</h2>
        <div className="grid sm:grid-cols-2">{box("roles", ROLES)}</div>
        <input className={`${input} mt-2`} placeholder="Другое" value={d.roleOther} onChange={(e) => set("roleOther", e.target.value)} />

        <h2 className={h}>4. Что интересует на стенде iRidi</h2>
        <div className="grid sm:grid-cols-2">{box("interests", INTERESTS)}</div>

        <h2 className={h}>5. Интересующие направления</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3">{box("directions", DIRECTIONS)}</div>

        <h2 className={h}>6. Что интересует</h2>
        <div className="grid">{box("intents", INTENTS)}</div>

        <h2 className={h}>7. Телефон</h2>
        <input className={input} type="tel" inputMode="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />

        <h2 className={h}>8. Email</h2>
        <input className={input} type="email" inputMode="email" autoCapitalize="none" value={d.email} onChange={(e) => set("email", e.target.value)} />

        <h2 className={h}>9. Выслать/сделать после выставки</h2>
        <textarea className={input} rows={3} value={d.followup} onChange={(e) => set("followup", e.target.value)} />

        <button className="mt-8 w-full rounded-xl bg-[#e30613] py-5 text-2xl font-bold text-white active:opacity-80">
          Сохранить анкету
        </button>
      </form>
    </main>
  );
}
