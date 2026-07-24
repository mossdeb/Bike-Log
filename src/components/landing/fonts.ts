import { Exo_2, Roboto } from "next/font/google";

export const landingHeadingFont = Exo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-landing-heading",
});

export const landingBodyFont = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-landing-body",
});
