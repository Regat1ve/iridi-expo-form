import { headers } from "next/headers";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

const CALL: Record<string, string> = {
  ru: "Заполните анкету на своём телефоне",
  en: "Fill in the form on your phone",
  de: "Füllen Sie den Fragebogen auf Ihrem Handy aus",
  zh: "用手机填写问卷",
};

// Print-ready A4 sign for the booth: visitors scan and fill the same form on their own phone.
export default async function Qr() {
  const url = `https://${(await headers()).get("host")}/`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1 });
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-black">Анкета iRidi</h1>
      <div className="w-full max-w-sm" dangerouslySetInnerHTML={{ __html: svg }} />
      <ul className="space-y-1 text-xl">
        {Object.values(CALL).map((t) => <li key={t}>{t}</li>)}
      </ul>
      <p className="text-neutral-500">{url}</p>
    </main>
  );
}
