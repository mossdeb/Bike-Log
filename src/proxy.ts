import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match every route except static assets and /api, so the session
    // cookie stays fresh everywhere without re-running on _next internals.
    // /api routes (e.g. the cron endpoint) use their own auth and must not
    // get redirected to /login for lacking a browser session.
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
