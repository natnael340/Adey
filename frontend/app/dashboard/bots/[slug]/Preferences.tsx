"use client";

import React, { useContext, useState } from "react";
import { Context } from "./ChatDetailContext";
import { ThemeType } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isSelected = (theme: ThemeType) => {
    return pref?.identifier === theme.identifier;
  };

  const isCurrentTheme = (theme: ThemeType) => {
    return bot.preference?.identifier === theme.identifier;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Widget Theme</h3>
            <p className="text-xs text-slate-500">
              Customize the appearance of your chatbot
            </p>
          </div>
        </div>
        <Button
          onClick={ApplyChange}
          disabled={
            !(pref != null && bot.preference?.identifier != pref.identifier)
          }
          className="h-9 px-4 text-sm bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50"
        >
          Apply Theme
        </Button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {preferences.map((theme) => (
            <button
              onClick={() => changeTheme(theme)}
              key={theme.identifier}
              className={cn(
                "group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                isSelected(theme)
                  ? "border-slate-900 bg-slate-50"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-50/50"
              )}
            >
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-xl shadow-sm ring-2 ring-white"
                  style={
                    theme.preferences.widget.widgetBackgroundType === "solid"
                      ? {
                          backgroundColor:
                            theme.preferences.widget.widgetBackground,
                        }
                      : { background: theme.preferences.widget.widgetBackground }
                  }
                />
                {isCurrentTheme(theme) && !pref && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                {isSelected(theme) && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
              <span className="mt-2.5 text-sm font-medium text-slate-700">
                {theme.name}
              </span>
              {isCurrentTheme(theme) && !pref && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  Current
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Preferences;
