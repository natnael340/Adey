"use client";

import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type ParamType = {
  value: string;
  items: string[];
  set_value: (value: string) => void;
};

const Dropdown = ({ value, items, set_value }: ParamType) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const container = useRef<HTMLDivElement>(null);

  const handleOnClick: any = (event: MouseEvent) => {
    if (
      container.current &&
      !container.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOnClick);

    return () => {
      document.removeEventListener("click", handleOnClick);
    };
  }, []);

  return (
    <div ref={container} className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200"
        type="button"
      >
        <span>{value}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            showDropdown ? "rotate-180" : ""
          }`}
        />
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 z-50 min-w-[160px] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-1">
            {items.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    set_value(item);
                    setShowDropdown(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                    value === item
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate">{item}</span>
                  {value === item && (
                    <Check size={16} className="text-amber-500 flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
