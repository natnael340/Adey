import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Copy, MoreVertical } from "lucide-react";
import RoleBadge from "@/components/ui/role-badge";

// Role type
type Role = "HUMAN" | "AI" | "SYSTEM";

// Utility: format date parts
function fmtDateTime(iso: string) {
  const ts = new Date(iso);
  const date = ts.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const time = ts.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { ts, date, time };
}

function MessageCard({
  name,
  avatarUrl,
  role,
  timestampISO,
  message,
  meta,
  sourceLabel,
}: {
  name: string;
  avatarUrl?: string;
  role: Role;
  timestampISO: string;
  message: string;
  meta?: Record<string, string>;
  sourceLabel?: string; // e.g., "Anonymous"
}) {
  const { ts, date, time } = fmtDateTime(timestampISO);
  const trimmed = message.trim();
  const isJson =
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"));
  let pretty = trimmed;
  try {
    if (isJson) pretty = JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {}

  const onCopy = () => navigator.clipboard.writeText(message);

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader className="py-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || "https://placehold.co/40x40"} />
            <AvatarFallback>{name?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-medium truncate">{name}</h3>
              <RoleBadge role={role} />
              {sourceLabel && (
                <span className="text-[11px] text-zinc-500">
                  • {sourceLabel}
                </span>
              )}
              <time
                className="ml-auto text-xs text-zinc-500"
                dateTime={timestampISO}
                title={ts.toLocaleString()}
              >
                {date} • {time}
              </time>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-1"
                    aria-label="More"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={onCopy} className="gap-2">
                    <Copy className="h-4 w-4" /> Copy message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {isJson ? (
          <ScrollArea className="max-h-40 rounded-md border bg-zinc-50 p-3 text-xs">
            <pre className="whitespace-pre" aria-label="JSON content">
              {pretty}
            </pre>
          </ScrollArea>
        ) : (
          <p className="whitespace-pre-wrap leading-6 [overflow-wrap:anywhere] text-sm">
            {message}
          </p>
        )}
        {meta && (
          <div className="mt-3">
            <details>
              <summary className="text-xs text-zinc-500 cursor-pointer select-none">
                Metadata
              </summary>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                {Object.entries(meta).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-zinc-500 shrink-0 w-28">{k}:</span>
                    <span className="truncate" title={v}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Date header component
function DateHeader({ label }: { label: string }) {
  return (
    <div className="my-2">
      <div className="relative flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-wide text-zinc-500 px-2 bg-white">
          {label}
        </span>
        <Separator className="flex-1" />
      </div>
    </div>
  );
}
