// Network-first for page + assets, cache as fallback: the form still opens on the iPad when Wi-Fi drops.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).pathname.startsWith("/api/") || new URL(req.url).pathname.startsWith("/admin")) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open("iridi").then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
