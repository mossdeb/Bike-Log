import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// /privacy and /terms have to answer to signed-out visitors and to crawlers:
// Google reads them when verifying the OAuth consent screen's branding, and a
// policy only reachable behind a login is no policy at all.
const PUBLIC_ROUTES = ["/login", "/signup", "/auth", "/forgot-password", "/privacy", "/terms"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and getClaims() — see
  // https://supabase.com/docs/guides/auth/server-side/nextjs for why.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // "/" is the landing page for signed-out visitors — exact match only, or
  // startsWith would make every route public.
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup" ||
      request.nextUrl.pathname === "/forgot-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Must return supabaseResponse as-is (or copy its cookies onto a new
  // response) or the browser and server session cookies go out of sync.
  return supabaseResponse;
}
