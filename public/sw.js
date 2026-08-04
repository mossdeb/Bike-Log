// Minimal service worker — no caching, so there's no stale-data risk to
// reason about. It exists for two reasons: some browsers (notably Chrome on
// Android) require a registered service worker with a fetch handler before
// they'll consider the app installable, and Web Push can only be delivered
// through one.
self.addEventListener("fetch", () => {});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      // Same tag replaces the previous notification instead of stacking, so a
      // component that keeps qualifying never buries the rest of the tray.
      tag: payload.tag,
      data: { url: payload.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/dashboard", self.location.origin);

  // Prefer an already-open Bikit window — on the installed PWA that's the app
  // the user is looking at, and opening a second one would leave a stray copy
  // behind. openWindow is only the fallback for a cold start.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).origin === target.origin && "focus" in client) {
          return client.navigate(target.href).then((c) => (c || client).focus());
        }
      }
      return self.clients.openWindow(target.href);
    })
  );
});
