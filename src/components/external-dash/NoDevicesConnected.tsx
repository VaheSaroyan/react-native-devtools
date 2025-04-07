import React, { useState } from "react";

export const NoDevicesConnected = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <div className="bg-[#1A1A1C] rounded-3xl p-8 border border-[#2D2D2F]/50 max-w-md shadow-[0_1rem_3rem_rgba(0,0,0,0.3)] transition-shadow duration-700 ease-out hover:shadow-[0_1rem_3rem_rgba(59,130,246,0.1)] hover:scale-[1.01]">
          <svg
            className="w-16 h-16 text-[#9E9EA0] mx-auto mb-6 opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <h3 className="text-xl font-medium text-white mb-3">
            No Devices Connected
          </h3>
          <p className="text-gray-100 text-sm leading-relaxed mb-6">
            Please ensure this app is running and then start or restart your
            devices to establish a connection.
          </p>
          <div className="text-sm text-gray-100 bg-[#26262A] rounded-xl p-5 border border-[#3D3D42] shadow-inner">
            <p className="font-semibold mb-3 text-white">
              Troubleshooting steps:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-left">
              <li className="pl-1">Verify the app is running</li>
              <li className="pl-1">Restart your development devices</li>
              <li className="flex items-start gap-1.5 flex-wrap pl-1">
                <span>Please read the</span>
                <button
                  onClick={() =>
                    handleCopy(
                      "https://github.com/LovesWorking/rn-better-dev-tools",
                      "Documentation"
                    )
                  }
                  className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer inline-flex items-center gap-1 relative group transition-colors duration-300 font-medium"
                >
                  documentation
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  {copiedText === "Documentation" && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-[#0A0A0C] text-xs text-white rounded-lg shadow-lg border border-[#2D2D2F]/50 animate-fadeIn">
                      Copied!
                    </span>
                  )}
                </button>
                <span>or</span>
                <button
                  onClick={() =>
                    handleCopy(
                      "https://github.com/LovesWorking/rn-better-dev-tools/issues",
                      "Issues"
                    )
                  }
                  className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer inline-flex items-center gap-1 relative group transition-colors duration-300 font-medium"
                >
                  create an issue
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  {copiedText === "Issues" && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-[#0A0A0C] text-xs text-white rounded-lg shadow-lg border border-[#2D2D2F]/50 animate-fadeIn">
                      Copied!
                    </span>
                  )}
                </button>
                <span>for help</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};
