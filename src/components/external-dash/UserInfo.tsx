import React, { useState } from "react";
import { User } from "./types/User";

interface Props {
  userData: User;
  isTargeted?: boolean;
}

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  const normalizedPlatform = platform.toLowerCase();

  switch (normalizedPlatform) {
    case "ios":
      return (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      );
    case "android":
      return (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.61 15.15c-.46 0-.84-.37-.84-.83s.37-.83.84-.83.83.37.83.83-.37.83-.83.83m-9.22 0c-.46 0-.83-.37-.83-.83s.37-.83.83-.83.84.37.84.83-.37.83-.84.83m9.42-5.89l1.67-2.89c.09-.17.03-.38-.13-.47-.17-.09-.38-.03-.47.13l-1.69 2.93A9.973 9.973 0 0012 7.75c-1.89 0-3.63.52-5.19 1.37L5.12 6.19c-.09-.17-.3-.22-.47-.13-.17.09-.22.3-.13.47l1.67 2.89C3.44 11.15 1.62 14.56 1.62 18h20.76c0-3.44-1.82-6.85-4.57-8.74z" />
        </svg>
      );
    case "web":
      return (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2m-5.15 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56M14.34 14H9.66c-.1-.66-.16-1.32-.16-2 0-.68.06-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2M12 19.96c-.83-1.2-1.5-2.53-1.91-3.96h3.82c-.41 1.43-1.08 2.76-1.91 3.96M8 8H5.08A7.923 7.923 0 019.4 4.44C8.8 5.55 8.35 6.75 8 8m-2.92 8H8c.35 1.25.8 2.45 1.4 3.56A8.008 8.008 0 015.08 16m-.82-2C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2M12 4.03c.83 1.2 1.5 2.54 1.91 3.97h-3.82c.41-1.43 1.08-2.77 1.91-3.97M18.92 8h-2.95a15.65 15.65 0 00-1.38-3.56c1.84.63 3.37 1.9 4.33 3.56M12 2C6.47 2 2 6.5 2 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z" />
        </svg>
      );
    case "tv":
    case "tvos":
      return (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 17H3V5h18m0-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.25 18H6.75V4h10.5M14 21h-4v-1h4m2-19H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3z" />
        </svg>
      );
  }
};

const getPlatformColor = (platform: string): string => {
  const normalizedPlatform = platform.toLowerCase();
  switch (normalizedPlatform) {
    case "ios":
      return "bg-gray-700 text-gray-100";
    case "android":
      return "bg-green-900/40 text-green-300";
    case "web":
      return "bg-blue-900/40 text-blue-300";
    case "tv":
    case "tvos":
      return "bg-purple-900/40 text-purple-300";
    default:
      return "bg-gray-700 text-gray-300";
  }
};

export const UserInfo: React.FC<Props> = ({ userData, isTargeted = false }) => {
  const [expanded, setExpanded] = useState(false);
  const platform = userData.platform || "Unknown";
  const isConnected =
    userData.isConnected !== undefined ? userData.isConnected : true;
  const connectionStatusText = isConnected ? "Connected" : "Disconnected";

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
              className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${getPlatformColor(
                platform
              )}`}
            >
              <PlatformIcon platform={platform} />
              {platform}
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

            {userData?.extraDeviceInfo &&
            Object.keys(userData.extraDeviceInfo).length > 0 ? (
              <>
                <div className="col-span-2 border-t border-gray-700 my-3" />
                <div className="col-span-2 text-gray-400 font-medium mb-2">
                  Device Information:
                </div>
                {Object.entries(userData.extraDeviceInfo).map(
                  ([key, value]) => (
                    <InfoRow
                      key={key}
                      label={key}
                      value={value}
                      className="text-gray-200"
                      labelClassName="text-gray-400"
                    />
                  )
                )}
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
