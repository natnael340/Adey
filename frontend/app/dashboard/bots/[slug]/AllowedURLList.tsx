"use client";

import React, { useContext } from "react";
import { Context } from "./ChatDetailContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Globe, Link as LinkIcon } from "lucide-react";

const AllowedURLList = () => {
  let { bot } = useContext(Context);

  if (!bot.allowed_urls || bot.allowed_urls.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Allowed URLs</h3>
          <p className="text-xs text-slate-500">
            Domains where the widget can be embedded
          </p>
        </div>
      </div>
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                URL
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bot.allowed_urls.map((url, idx) => (
              <TableRow key={idx} className="hover:bg-slate-50/50">
                <TableCell className="font-mono text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                    {url}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllowedURLList;
