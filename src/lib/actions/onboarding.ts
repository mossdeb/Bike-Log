"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding() {
  const supabase = await createClient();

  await supabase.auth.updateUser({
    data: { onboarding_completed: true },
  });

  // Same JWT-staleness issue as settings.ts — refresh so a re-render of the
  // dashboard in this same request doesn't show the dialog again.
  await supabase.auth.refreshSession();

  revalidatePath("/", "layout");
}
