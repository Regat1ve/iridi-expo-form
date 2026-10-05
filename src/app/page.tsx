"use client";

import { useCallback, useEffect, useState } from "react";
import { DIRECTIONS, INTENTS, INTERESTS, LANGS, ROLES, type Lang, type Lead } from "@/lib/form";
import { DICT } from "@/lib/i18n";

const QUEUE = "iridi-queue";
const LANG = "iridi-lang";
type Draft = Omit<Lead, "id" | "filledAt" | "lang">;
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
  const [lang, setLang] = useState<Lang>("ru");
  const t = DICT[lang];

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
    // Saved choice on this device, else the phone's language (QR visitors), else Russian.
    let saved: string | null = null;
    try { saved = localStorage.getItem(LANG); } catch {}
    const guess = saved ?? navigator.language.slice(0, 2);
    setLang(LANGS.find((l) => l === guess) ?? "ru");
    flush();
    navigator.serviceWorker?.register("/sw.js");
    const timer = setInterval(flush, 15000);
    window.addEventListener("online", flush);
    return () => { clearInterval(timer); window.removeEventListener("online", flush); };
  }, [flush]);

  const set = (k: keyof Draft, v: string) => setD({ ...d, [k]: v });
  const toggle = (k: ListKey, v: string) =>
    setD({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!d.phone.trim() && !d.email.trim())
      return setMsg({ text: t.needContact, ok: false });
    writeQueue([...readQueue(), { ...d, lang, id: crypto.randomUUID(), filledAt: new Date().toISOString() }]);
    setD(empty());
    setMsg({ text: `${t.saved}: ${d.name}`, ok: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    flush();
  }

  // Shows the translated label, stores the canonical Russian value.
  const box = (k: ListKey, options: string[]) =>
    options.map((o, i) => (
      <label key={o} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 active:bg-neutral-100">
        <input type="checkbox" className="size-7 shrink-0 accent-[#e30613]"
          checked={d[k].includes(o)} onChange={() => toggle(k, o)} />
        <span className="text-lg">{t[k][i]}</span>
      </label>
    ));

  const input = "w-full rounded-lg border-2 border-neutral-300 px-4 py-3 text-xl focus:border-[#e30613] focus:outline-none";
  const h = "mb-3 mt-8 text-2xl font-bold";

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{t.title}</h1>
        <span data-testid="sync" className={`rounded-full px-3 py-1 text-sm ${pending ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-900"}`}>
          {pending ? `${t.pending}: ${pending}` : t.allSent}
        </span>
      </header>
      <nav className="mt-4 flex gap-2" aria-label="Language">
        {LANGS.map((l) => (
          <button key={l} type="button" aria-pressed={l === lang}
            onClick={() => { setLang(l); try { localStorage.setItem(LANG, l); } catch {} }}
            className="min-h-12 min-w-14 rounded-lg border-2 border-neutral-300 px-3 font-semibold aria-pressed:border-[#e30613] aria-pressed:text-[#e30613]">
            {DICT[l].label}
          </button>
        ))}
      </nav>

      {msg && (
        <p className={`mt-4 rounded-lg p-4 text-lg ${msg.ok ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
          {msg.text}
        </p>
      )}

      <form onSubmit={submit} onChange={() => setMsg(null)}>
        <h2 className={h}>1. {t.q[0]} *</h2>
        <input className={input} required aria-label={t.q[0]} value={d.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" />

        <h2 className={h}>2. {t.q[1]}</h2>
        <input className={input} aria-label={t.q[1]} value={d.company} onChange={(e) => set("company", e.target.value)} autoComplete="off" />

        <h2 className={h}>3. {t.q[2]}</h2>
        <div className="grid sm:grid-cols-2">{box("roles", ROLES)}</div>
        <input className={`${input} mt-2`} placeholder={t.other} aria-label={t.other} value={d.roleOther} onChange={(e) => set("roleOther", e.target.value)} />

        <h2 className={h}>4. {t.q[3]}</h2>
        <div className="grid sm:grid-cols-2">{box("interests", INTERESTS)}</div>

        <h2 className={h}>5. {t.q[4]}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3">{box("directions", DIRECTIONS)}</div>

        <h2 className={h}>6. {t.q[5]}</h2>
        <div className="grid">{box("intents", INTENTS)}</div>

        <h2 className={h}>7. {t.q[6]}</h2>
        <input className={input} type="tel" inputMode="tel" aria-label={t.q[6]} value={d.phone} onChange={(e) => set("phone", e.target.value)} />

        <h2 className={h}>8. {t.q[7]}</h2>
        <input className={input} type="email" inputMode="email" autoCapitalize="none" aria-label={t.q[7]} value={d.email} onChange={(e) => set("email", e.target.value)} />

        <h2 className={h}>9. {t.q[8]}</h2>
        <textarea className={input} rows={3} aria-label={t.q[8]} value={d.followup} onChange={(e) => set("followup", e.target.value)} />

        <button className="mt-8 w-full rounded-xl bg-[#e30613] py-5 text-2xl font-bold text-white active:opacity-80">
          {t.submit}
        </button>
      </form>
    </main>
  );
}
