"use client";

import React from "react";

const Code = ({ code }: { code: string }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };
  return (
    <div className="bg-gray-900 text-white p-4 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400">Code:</span>
        <button
          className="code bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-md"
          data-clipboard-target="#code"
          onClick={copyToClipboard}
        >
          Copy
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre id="code" className="text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default Code;
