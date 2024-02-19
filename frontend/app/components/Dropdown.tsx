"use client";

import React, { MouseEvent, useEffect, useRef, useState } from "react";

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
    <div ref={container} className="min-w-40 flex flex-col items-end relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-gray-400 ring-1 ring-amber-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        {value}
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>
      <div
        className={`absolute top-10 right-0 z-10 ${
          showDropdown ? "" : "hidden"
        } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          {items.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => {
                  set_value(item);
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
