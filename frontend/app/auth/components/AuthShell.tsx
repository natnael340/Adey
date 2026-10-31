import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { brandFonts } from "@/app/fonts";
import { focusRing } from "@/app/components/brand/Button";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      data-canvas="meadow"
      className={cn(
        brandFonts,
        "flex min-h-svh flex-col items-center justify-center gap-6 bg-adey-meadow p-6 font-grotesk text-adey-seed antialiased md:p-10"
      )}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className={cn("self-center rounded-control", focusRing())}
        >
          <img
            src="/brand/adey-lockup-horizontal.svg"
            alt="Adey"
            className="h-8 w-auto"
          />
        </Link>
        {children}
      </div>
    </main>
  );
}
