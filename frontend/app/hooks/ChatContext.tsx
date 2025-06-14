"use client";

import Api from "@/app/components/Api";
import React, { useEffect, useState, createContext } from "react";

export const Context = createContext<{
  botAdded: boolean;
  setBotAdded: (value: boolean) => void;
  api?: Api;
  formOpen: boolean;
  toggleFormOpen: () => void;
}>({
  botAdded: false,
  setBotAdded: (value: boolean) => {},
  formOpen: false,
  toggleFormOpen: () => {},
});

type ParamType = {
  children: React.ReactElement | React.ReactElement[];
  token: string;
};
const ChatContext = ({ children, token }: ParamType) => {
  const [botAdded, setBotAdded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const api = new Api(token);

  const toggleFormOpen = () => {
    console.log("toggle form open");
    setFormOpen(!formOpen);
  };

  return (
    <Context.Provider
      value={{ botAdded, setBotAdded, api: api, formOpen, toggleFormOpen }}
    >
      {children}
    </Context.Provider>
  );
};

export default ChatContext;
