"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient();

  await supabase.auth.updateUser({
    data: {
      distance_unit: formData.get("distance_unit") as string,
      language: formData.get("language") as string,
    },
  });

  // updateUser() writes the new metadata to the DB immediately, but the
  // session's JWT (what getClaims() reads elsewhere) still has the old
  // metadata baked in until the token is refreshed — do that now so the
  // change is visible on this same render instead of the next natural
  // refresh.
  await supabase.auth.refreshSession();

  revalidatePath("/", "layout");
}
