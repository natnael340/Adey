"use client";

import React from "react";

const Code = ({ code }: { code: string }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };
  return (
    <div className="bg-slate-900 text-white p-4 rounded-lg max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-400 uppercase tracking-wider">Code</span>
        <button
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors"
          onClick={copyToClipboard}
        >
          Copy
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="text-sm text-slate-300 whitespace-pre-wrap break-all">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default Code;
