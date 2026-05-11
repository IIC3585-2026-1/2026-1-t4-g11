// SW auxiliar: solo maneja push directo (no interfiere con Firebase)
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification("Carbon (background)", {
      body: data.body || "",
      icon: "/carbon.svg",
      badge: "/pwa-64x64.png",
    }),
  );
});
