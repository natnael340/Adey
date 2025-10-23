"use client";

import Api from "@/app/components/Api";
import { ChatDetailType, PreferenceType } from "@/app/types/types";
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
  bot: ChatDetailType;
  setBot: (value: ChatDetailType) => void;
  preference: PreferenceType | null;
  setPreference: (value: PreferenceType | null) => void;
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
  preference: null,
  setPreference: (value) => {},
});

type ParamType = {
  children: React.ReactElement | React.ReactElement[];
  token: string;
  identifier: string;
  bot: ChatDetailType;
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
  const [bot, setBot] = useState<ChatDetailType>(_bot);
  const [preference, setPreference] = useState<PreferenceType | null>(
    bot.preference?.preferences || null
  );
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
        preference,
        setPreference,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ChatDetailContext;
