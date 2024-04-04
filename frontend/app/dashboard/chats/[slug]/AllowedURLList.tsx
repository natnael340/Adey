"use client";

import { Table } from "flowbite-react";
import React, { useContext } from "react";
import { Context } from "./ChatDetailContext";

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
          <Table.Head>
            <Table.HeadCell>URL</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {bot.allowed_urls.map((url, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>{url}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default AllowedURLList;
