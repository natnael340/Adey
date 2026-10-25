import React from "react";
import { notFound } from "next/navigation";

// Dev-only tool: the style guide 404s in production builds
export default function StyleGuideLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <>{children}</>;
}
