import { redirect } from "next/navigation";

export default function Home() {
  // proxy.ts already redirects unauthenticated requests to /login before
  // this ever renders, so reaching here means the user is signed in.
  redirect("/dashboard");
}
