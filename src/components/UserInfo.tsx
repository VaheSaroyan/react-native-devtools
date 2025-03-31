import React, { useState } from "react";
import { User } from "../types/User";

interface Props {
  userData: User;
}

export const UserInfo: React.FC<Props> = ({ userData }) => {
  const [expanded, setExpanded] = useState(false);

  // Get platform with fallback to Unknown
  const platform = userData.platform || "Unknown";

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 shadow-md w-full">
      <div
        className="flex justify-between items-center border-b border-gray-700 pb-2 mb-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-200 mr-3">
            {userData.deviceName}
          </h2>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
            {platform}
          </span>
        </div>

        <div className="flex items-center">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              userData.deviceId
                ? "bg-green-900 text-green-300"
                : "bg-yellow-900 text-yellow-300"
            }`}
          >
            {userData.deviceId ? "Connected" : "Legacy Connection"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ml-2 text-gray-400 transition-transform ${
              expanded ? "transform rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 text-sm animate-fadeIn">
          <div className="text-gray-400">Socket ID:</div>
          <div className="text-gray-200 font-mono overflow-hidden text-ellipsis">
            {userData.id}
          </div>

          {userData.deviceId && (
            <>
              <div className="text-gray-400">Device ID:</div>
              <div className="text-gray-200 font-mono overflow-hidden text-ellipsis">
                {userData.deviceId}
              </div>
            </>
          )}

          <div className="text-gray-400 mt-2">Platform:</div>
          <div className="text-gray-200 mt-2">{platform}</div>

          <div className="text-gray-400">Connection Type:</div>
          <div className="text-gray-200">
            {userData.deviceId
              ? "Persistent Connection"
              : "Standard Connection"}
          </div>

          <div className="col-span-2 border-t border-gray-700 mt-3 pt-3 text-xs text-gray-400">
            <p>Click the header to collapse this panel</p>
          </div>
        </div>
      )}
    </div>
  );
};
