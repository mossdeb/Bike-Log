"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { stravaAuthorizeUrl } from "@/lib/strava";

export async function connectStrava() {
  const origin = (await headers()).get("origin");
  redirect(stravaAuthorizeUrl(`${origin}/api/strava/callback`));
}

export async function disconnectStrava() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims?.sub as string | undefined;
  if (!userId) redirect("/login");

  // Bikes keep their history, but the gear mapping is meaningless once the
  // connection (and its tokens) are gone.
  await supabase.from("bikes").update({ strava_gear_id: null }).eq("user_id", userId);
  await supabase.from("strava_connections").delete().eq("user_id", userId);

  revalidatePath("/settings");
  redirect("/settings");
}

export async function updateBikeStravaGear(bikeId: string, formData: FormData) {
  const supabase = await createClient();
  const gearId = (formData.get("strava_gear_id") as string) || null;

  await supabase.from("bikes").update({ strava_gear_id: gearId }).eq("id", bikeId);

  revalidatePath(`/bikes/${bikeId}`);
  revalidatePath(`/bikes/${bikeId}/edit`);
  redirect(`/bikes/${bikeId}/edit`);
}
