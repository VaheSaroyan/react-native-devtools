import React, { useState } from "react";
import { User } from "./types/User";
import {
  PlatformIcon,
  getDisplayPlatform,
  getPlatformBgColor,
} from "./utils/platformUtils";

interface Props {
  userData: User;
  isTargeted?: boolean;
}

export const UserInfo: React.FC<Props> = ({ userData, isTargeted = false }) => {
  const [expanded, setExpanded] = useState(false);
  const platform = userData.platform || "Unknown";
  const displayPlatform = getDisplayPlatform(platform);
  const isConnected =
    userData.isConnected !== undefined ? userData.isConnected : true;
  const connectionStatusText = isConnected ? "Connected" : "Disconnected";
  // Parse extraDeviceInfo if it exists
  const extraDeviceInfo = userData.extraDeviceInfo
    ? JSON.parse(userData.extraDeviceInfo)
    : {};
  return (
    <div className="relative isolate w-full mb-4">
      <div
        className={`relative z-10 bg-gray-800 border border-gray-700 transition-all duration-200 ease-in-out
          ${isTargeted ? "ring-2 ring-blue-400" : ""}
          ${expanded ? "scale-[1.02]" : "scale-100"}
          rounded-xl p-5 shadow-lg hover:shadow-xl`}
      >
        <div
          className="flex justify-between items-center cursor-pointer group select-none"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className={`w-2.5 h-2.5 rounded-full 
                  ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              />
            </div>

            <h2
              className={`text-lg font-medium tracking-tight antialiased
              ${isTargeted ? "text-blue-300" : "text-gray-200"}`}
            >
              {userData.deviceName}
            </h2>

            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${getPlatformBgColor(
                platform
              )}`}
            >
              <PlatformIcon platform={platform} />
              {displayPlatform}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full
                ${
                  userData.deviceId
                    ? isConnected
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                    : "bg-yellow-900 text-yellow-300"
                }`}
            >
              {userData.deviceId ? connectionStatusText : "Legacy"}
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-gray-400 transition-transform duration-200
                ${expanded ? "rotate-180" : ""}
                group-hover:text-gray-300`}
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
          <div className="grid grid-cols-2 gap-3 text-sm mt-4 animate-fadeIn border-t border-gray-700 pt-4 select-text">
            <InfoRow label="Socket ID" value={userData.id} monospace />

            {userData.deviceId && (
              <InfoRow label="Device ID" value={userData.deviceId} monospace />
            )}

            <InfoRow label="Platform" value={platform} />

            <InfoRow
              label="Connection Status"
              value={connectionStatusText}
              className={isConnected ? "text-green-400" : "text-red-400"}
            />

            <InfoRow
              label="Connection Type"
              value={
                userData.deviceId
                  ? "Persistent Connection"
                  : "Standard Connection"
              }
            />

            {isTargeted && (
              <InfoRow
                label="Target Status"
                value="Currently Targeted"
                className="text-blue-300"
                labelClassName="text-blue-400"
              />
            )}

            {Object.keys(extraDeviceInfo).length > 0 ? (
              <>
                <div className="col-span-2 border-t border-gray-700 my-3" />
                <div className="col-span-2 text-gray-400 font-medium mb-2">
                  Device Information:
                </div>
                {Object.entries(extraDeviceInfo).map(([key, value]) => (
                  <InfoRow
                    key={key}
                    label={key}
                    value={value as string}
                    className="text-gray-200"
                    labelClassName="text-gray-400"
                  />
                ))}
              </>
            ) : (
              <>
                <div className="col-span-2 border-t border-gray-700 my-3" />
                <div className="col-span-2 flex flex-col items-center gap-2 text-center py-2">
                  <div className="text-gray-400 font-medium">
                    No Device Information Provided
                  </div>
                  <div className="text-xs text-gray-500">
                    Pass custom device info via the{" "}
                    <code className="px-1 py-0.5 bg-gray-700 rounded">
                      extraDeviceInfo
                    </code>{" "}
                    prop:
                  </div>
                  <code className="text-xs bg-gray-700/50 rounded p-2 font-mono text-gray-300 w-full">
                    extraDeviceInfo: {"{"}
                    "Model": "iPhone 14", "OS": "iOS 16.0", ...
                    {"}"}
                  </code>
                </div>
              </>
            )}

            <div className="col-span-2 text-xs text-gray-400 mt-2 flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Click header to collapse</span>
            </div>
          </div>
        )}
      </div>
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-b from-gray-800/50 to-transparent rounded-xl transition-opacity duration-200
          ${expanded ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      />
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  monospace?: boolean;
  className?: string;
  labelClassName?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  monospace,
  className = "text-gray-200",
  labelClassName = "text-gray-400",
}) => (
  <>
    <div className={`${labelClassName} font-medium antialiased`}>{label}:</div>
    <div
      className={`${className} ${
        monospace ? "font-mono" : ""
      } overflow-hidden text-ellipsis antialiased flex items-center gap-1.5`}
    >
      {label === "Platform" && <PlatformIcon platform={value} />}
      {value}
    </div>
  </>
);
