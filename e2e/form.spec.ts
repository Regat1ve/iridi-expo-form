import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const csv = async (request: APIRequestContext) =>
  (await request.get("/api/export?format=csv&key=test-key")).text();

const uniq = (p: string) => `${p} ${Date.now()}`;

async function fill(page: Page, name: string, opts: { phone?: string; check?: string[] } = {}) {
  await page.getByLabel("Имя").fill(name);
  for (const c of opts.check ?? []) await page.getByRole("checkbox", { name: c, exact: true }).check();
  if (opts.phone !== "") await page.getByLabel("Телефон").fill(opts.phone ?? "+7 999 000-00-00");
  await page.getByRole("button", { name: "Сохранить анкету" }).click();
}

test("anketa goes to the database and shows in Excel export", async ({ page, request }) => {
  const name = uniq("Онлайн");
  await page.goto("/");
  await fill(page, name, { check: ["интегратор", "SmartHome"] });
  await expect(page.getByText(`Анкета сохранена: ${name}`)).toBeVisible();
  await expect(page.getByTestId("sync")).toHaveText("Всё отправлено");
  await expect(page.getByLabel("Имя")).toHaveValue("");

  const rows = (await csv(request)).split("\r\n").filter((r) => r.includes(name));
  expect(rows).toHaveLength(1);
  expect(rows[0]).toContain("интегратор");
  expect(rows[0]).toContain("SmartHome");

  const xlsx = await request.get("/api/export?format=xlsx&key=test-key");
  expect(xlsx.headers()["content-type"]).toContain("spreadsheetml");
});

test.describe("server unreachable", () => {
  // page.route can't see requests that pass through a service worker in WebKit; this test is about the queue, not the SW.
  test.use({ serviceWorkers: "block" });
  test("anketa is kept on the device, survives reload and syncs later", async ({ page, request }) => {
    const name = uniq("Сервер недоступен");
    await page.route("**/api/leads", (r) => r.abort());
    await page.goto("/");
    await fill(page, name);
    await expect(page.getByTestId("sync")).toHaveText("Ждут отправки: 1");

    await page.reload(); // iPad restarted / tab reopened while the server is still unreachable
    await expect(page.getByTestId("sync")).toHaveText("Ждут отправки: 1");
    expect(await csv(request)).not.toContain(name);

    await page.unroute("**/api/leads");
    await expect(page.getByTestId("sync")).toHaveText("Всё отправлено", { timeout: 20_000 });
    expect(await csv(request)).toContain(name);
  });
});

// Playwright's offline mode in WebKit blocks requests before the service worker sees them,
// so the "page opens with no Wi-Fi" part can only be automated in Chromium.
test("no internet: page opens from cache, anketa waits and syncs", async ({ page, context, request, browserName }) => {
  test.skip(browserName === "webkit", "Playwright WebKit offline mode bypasses service workers");
  const name = uniq("Офлайн");
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // now the service worker controls the page and caches it

  await context.setOffline(true);
  await fill(page, name);
  await expect(page.getByTestId("sync")).toHaveText("Ждут отправки: 1");
  expect(await csv(request)).not.toContain(name);

  await page.reload(); // Wi-Fi still down: page comes from cache, queue from localStorage
  await expect(page.getByTestId("sync")).toHaveText("Ждут отправки: 1");

  await context.setOffline(false);
  await expect(page.getByTestId("sync")).toHaveText("Всё отправлено", { timeout: 20_000 });
  expect(await csv(request)).toContain(name);
});

test("form refuses an anketa without phone or email", async ({ page }) => {
  await page.goto("/");
  await fill(page, uniq("Без контакта"), { phone: "" });
  await expect(page.getByText("Укажите телефон или email")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("iridi-queue"))).toBeNull();
});

test("api: repeated send does not duplicate, junk is rejected or filtered", async ({ request }) => {
  const name = uniq("Дубль");
  const lead = {
    id: crypto.randomUUID(), filledAt: new Date().toISOString(), name, phone: "1",
    roles: ["интегратор", "<script>"],
  };
  expect((await request.post("/api/leads", { data: lead })).ok()).toBe(true);
  expect((await request.post("/api/leads", { data: lead })).ok()).toBe(true);
  const rows = (await csv(request)).split("\r\n").filter((r) => r.includes(name));
  expect(rows).toHaveLength(1);
  expect(rows[0]).not.toContain("<script>");

  const bad = await request.post("/api/leads", { data: { ...lead, id: crypto.randomUUID(), phone: "" } });
  expect(bad.status()).toBe(400);
});

test("German visitor: German labels, Russian values in Excel, language remembered", async ({ page, request }) => {
  const name = uniq("Deutsch");
  await page.goto("/");
  await page.getByRole("button", { name: "DE" }).click();
  await expect(page.getByRole("heading", { name: "iRidi Fragebogen" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "iRidi Fragebogen" })).toBeVisible();

  await page.getByLabel("Name").fill(name);
  await page.getByRole("checkbox", { name: "Systemintegrator" }).check();
  await page.getByLabel("Telefon").fill("+49 30 000000");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByTestId("sync")).toHaveText("Alles übertragen");

  const row = (await csv(request)).split("\r\n").find((r) => r.includes(name))!;
  expect(row).toContain('"интегратор"');
  expect(row).toContain('"DE"');
});

test("hot leads are flagged, the curious are not", async ({ page }) => {
  const hot = uniq("Горячий");
  const curious = uniq("Любопытный");
  await page.goto("/");
  await fill(page, hot, { check: ["Нужно КП, презентация, встреча или партнерство"] });
  await fill(page, curious, { check: ["Смотрю, что есть на рынке"] });
  await expect(page.getByTestId("sync")).toHaveText("Всё отправлено");

  await page.goto("/admin?key=test-key&hot=1");
  await expect(page.getByRole("row", { name: hot })).toBeVisible();
  await expect(page.getByRole("row", { name: curious })).toHaveCount(0);
});

test("admin and export are closed without the key", async ({ page, request }) => {
  await page.goto("/admin?key=wrong");
  await expect(page.getByText("Нет доступа")).toBeVisible();
  expect((await request.get("/api/export?format=csv")).status()).toBe(403);
});

test.describe("visitor with a Chinese phone", () => {
  test.use({ locale: "zh-CN" });
  test("opens the form in Chinese automatically", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "iRidi 调查问卷" })).toBeVisible();
  });
});
