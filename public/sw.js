// Minimal service worker — its only job is to exist and handle fetch, since
// some browsers (notably Chrome on Android) require a registered service
// worker with a fetch handler before they'll consider the app installable.
// Everything just passes straight through to the network; no caching, so
// there's no stale-data risk to reason about.
self.addEventListener("fetch", () => {});
