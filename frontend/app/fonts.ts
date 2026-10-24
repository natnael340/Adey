import { Newsreader, Schibsted_Grotesk } from "next/font/google";

// Adey's own voice: UI, headings and body copy
export const grotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-grotesk",
});

// The customer's voice: only for text quoted from their documents
export const documentSerif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-document",
  // Next has no metric overrides for Newsreader
  adjustFontFallback: false,
});

export const brandFonts = `${grotesk.variable} ${documentSerif.variable}`;
