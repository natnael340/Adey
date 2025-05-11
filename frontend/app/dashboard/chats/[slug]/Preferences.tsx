"use client";

import React, { useContext, useState } from "react";
import { Context } from "./ChatDetailContext";
import { ThemeType } from "@/app/types/types";
import { Button } from "@/components/ui/button";

type Props = {
  preferences: ThemeType[];
};
function Preferences({ preferences }: Props) {
  let { api, identifier, preference, setPreference, bot } = useContext(Context);
  const [pref, setPref] = useState<ThemeType | null>(null);

  const changeTheme = async (theme: ThemeType) => {
    setPreference(theme.preferences);
    setPref(theme);
  };

  const ApplyChange = async () => {
    if (api && pref) {
      try {
        await api.set_preference(identifier, pref.identifier);
      } catch (error) {
        console.error("Error changing theme:", error);
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl text-gray-900 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="my-3 text-lg font-medium">Themes</h1>
        <Button
          onClick={ApplyChange}
          variant="outline"
          disabled={
            !(pref != null && bot.preference?.identifier != pref.identifier)
          }
        >
          Apply
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {preferences.map((theme) => (
          <button
            onClick={() => changeTheme(theme)}
            key={theme.identifier}
            className="flex flex-col items-center justify-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={
                theme.preferences.widget.widgetBackgroundType == "solid"
                  ? {
                      backgroundColor:
                        theme.preferences.widget.widgetBackground,
                    }
                  : { background: theme.preferences.widget.widgetBackground }
              }
            ></div>
            <h2 className="text-base mt-2">{theme.name}</h2>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Preferences;
