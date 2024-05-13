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

type ParamType = {
  initialData: string[];
};
const AllowedURLList = () => {
  let { bot } = useContext(Context);

  return (
    <div className="bg-white p-5 rounded-xl">
      <h1 className="my-3 text-lg font-medium">Allowed urls</h1>
      <div>
        <Table className="my-5">
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead>URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bot.allowed_urls.map((url, idx) => (
              <TableRow key={idx}>
                <TableCell>{url}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllowedURLList;
