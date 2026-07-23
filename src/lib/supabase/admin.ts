import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/** Privileged client for admin-only operations (e.g. deleting a user).
 * Server-only — never import this from a Client Component. Requires
 * SUPABASE_SERVICE_ROLE_KEY, which is not the same as the publishable key
 * used everywhere else in the app. */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
