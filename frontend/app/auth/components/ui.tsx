import React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Button, { focusRing } from "@/app/components/brand/Button";

export const control = "h-10 w-full rounded-control text-sm";
export const input = cn(
  control,
  "border border-adey-mist bg-adey-paper px-3 text-adey-seed placeholder:text-adey-seed/40 hover:border-adey-seed/40",
  focusRing()
);
export const textLink = cn(
  "rounded-control text-adey-highland underline-offset-4 hover:underline",
  focusRing()
);

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-adey-mist bg-adey-paper p-6 shadow-sm">
      <div className="text-center">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-adey-seed/70">{subtitle}</p>
        )}
      </div>
      <div className="mt-6 grid gap-6">{children}</div>
    </div>
  );
}

// Plain sentences, one per message: errors are announced, success is polite
export function FormMessage({
  messages,
  tone = "error",
  children,
}: {
  messages: string[];
  tone?: "error" | "success";
  children?: React.ReactNode;
}) {
  if (!messages.length) return null;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "space-y-1 border-l-[3px] px-3 py-2 text-sm",
        tone === "error"
          ? "border-adey-alert bg-adey-alert/5 text-adey-alert"
          : "border-adey-highland bg-adey-highland/5 text-adey-highland"
      )}
    >
      {messages.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
      {children}
    </div>
  );
}

export function SubmitButton({
  loading,
  loadingText,
  children,
}: {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className={cn(control, "gap-2 py-0 text-sm")}
    >
      {loading ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
