"use client";

import Api from "@/app/components/Api";
import { ChatType } from "@/app/types/types";
import React, { useEffect, useState, createContext } from "react";

export const Context = createContext<{
  botChanged: boolean;
  setBotChanged: (value: boolean) => void;
  api?: Api;
  formOpen: boolean;
  toggleFormOpen: () => void;
  allowedUrls: string[];
  setAllowedUrls: (value: string[]) => void;
  identifier: string;
  bot: ChatType;
  setBot: (value: ChatType) => void;
}>({
  botChanged: false,
  setBotChanged: (value) => {},
  formOpen: false,
  toggleFormOpen: () => {},
  allowedUrls: [],
  setAllowedUrls: (value) => {},
  identifier: "",
  // @ts-ignore
  bot: null,
  setBot: (value) => {},
});

type ParamType = {
  children: React.ReactElement | React.ReactElement[];
  token: string;
  identifier: string;
  bot: ChatType;
};
const ChatDetailContext = ({
  children,
  token,
  identifier,
  bot: _bot,
}: ParamType) => {
  const [botChanged, setBotChanged] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);
  const [bot, setBot] = useState<ChatType>(_bot);
  const api = new Api(token);

  const toggleFormOpen = () => {
    setFormOpen(!formOpen);
  };

  return (
    <Context.Provider
      value={{
        botChanged,
        setBotChanged,
        api: api,
        formOpen,
        toggleFormOpen,
        allowedUrls,
        setAllowedUrls,
        identifier,
        bot,
        setBot,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ChatDetailContext;
