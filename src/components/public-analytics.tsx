import { Analytics } from "@vercel/analytics/next";

// Vercel Web Analytics, mounted only on the pages a signed-out visitor reaches:
// the landing page, the two legal documents and the auth screens.
//
// Deliberately not in the root layout. Measurement stops at the login boundary,
// so nothing about how someone uses their own bikes, components or settings is
// collected. That scope is what keeps the Cookies section of the privacy policy
// to a sentence and the app free of a consent banner — the collection is
// cookieless and writes nothing to the visitor's device.
//
// One component instead of four imports so the boundary moves in a single edit.
export function PublicAnalytics() {
  return <Analytics />;
}
