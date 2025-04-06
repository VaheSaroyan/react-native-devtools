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
      {isTargeted && (
        <>
          {/* Extended glow effect - furthest back */}
          <div
            className="absolute -inset-[3px] bg-gradient-to-r from-red-500/20 via-violet-500/20 to-blue-500/20 rounded-xl blur-xl animate-gradient"
            aria-hidden="true"
          />

          {/* Outer glow effect */}
          <div
            className="absolute -inset-[2px] bg-gradient-to-r from-red-500/50 via-violet-500/50 to-blue-500/50 rounded-xl blur-md animate-gradient"
            aria-hidden="true"
          />

          {/* Primary glowing border */}
          <div
            className="absolute -inset-[1px] bg-gradient-to-r from-red-500 via-violet-500 to-blue-500 rounded-xl opacity-100 animate-gradient"
            aria-hidden="true"
          />
        </>
      )}
      <div
        className={`relative bg-gray-800 transition-all duration-300 ease-in-out
          ${expanded ? "scale-[1.02]" : "scale-100 cursor-pointer"}
          ${!isTargeted && "border border-gray-700"}
          rounded-xl shadow-lg hover:shadow-xl`}
      >
        {/* Card Header - Full Width */}
        <div
          className="flex justify-between items-center cursor-pointer group select-none p-5 w-full"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300
                  ${isConnected ? "bg-green-500" : "bg-red-500"}
                 `}
              />
            </div>

            <h2
              className={`text-lg font-medium tracking-tight antialiased transition-colors duration-300
              ${
                isTargeted
                  ? "text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                  : "text-gray-200"
              }`}
            >
              {userData.deviceName}
            </h2>

            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 transition-colors duration-300
              ${getPlatformBgColor(platform)}
              ${isTargeted ? "ring-1 ring-blue-400/30" : ""}`}
            >
              <PlatformIcon platform={platform} />
              {displayPlatform}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300
                ${
                  userData.deviceId
                    ? isConnected
                      ? "bg-green-900/80 text-green-300"
                      : "bg-red-900/80 text-red-300"
                    : "bg-yellow-900/80 text-yellow-300"
                }
              `}
            >
              {userData.deviceId ? connectionStatusText : "Legacy"}
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-all duration-300
                ${expanded ? "rotate-180" : ""}
                ${isTargeted ? "text-blue-400" : "text-gray-400"}
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
          <div
            className="grid grid-cols-2 gap-3 text-sm px-5 pb-5 animate-fadeIn border-t border-gray-700 pt-4 select-text"
            onClick={(e) => e.stopPropagation()}
          >
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
                <div className="col-span-2 mb-2">
                  <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span>Device Specifications</span>
                  </div>
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
                <div className="col-span-2 mb-2">
                  <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                    <svg
                      className="w-4 h-4 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>Device Specifications</span>
                  </div>
                </div>
                <div className="col-span-2 text-xs text-gray-400">
                  <div className="mb-2">
                    No specifications available. Pass custom device info via the{" "}
                    <code className="px-1 py-0.5 bg-gray-700 rounded text-blue-300">
                      extraDeviceInfo
                    </code>{" "}
                    prop:
                  </div>
                  <code className="text-xs bg-gray-700/70 rounded p-2 font-mono text-gray-300 block w-full">
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
