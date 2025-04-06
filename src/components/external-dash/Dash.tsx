import React, { useEffect, useState } from "react";
import { User } from "./types/User";
import "../../index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools/production";

import { DeviceSelection } from "./DeviceSelection";
import { UserInfo } from "./UserInfo";

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  const normalizedPlatform = platform?.toLowerCase() || "";

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
  const normalizedPlatform = platform?.toLowerCase() || "";
  switch (normalizedPlatform) {
    case "ios":
      return "text-gray-100";
    case "android":
      return "text-green-300";
    case "web":
      return "text-blue-300";
    case "tv":
    case "tvos":
      return "text-purple-300";
    default:
      return "text-gray-300";
  }
};

interface DashProps {
  allDevices: User[];
  isDashboardConnected: boolean;
  targetDevice: User;
  setTargetDevice: (device: User) => void;
}

export const Dash: React.FC<DashProps> = ({
  isDashboardConnected,
  allDevices,
  targetDevice,
  setTargetDevice,
}) => {
  const [showOfflineDevices, setShowOfflineDevices] = useState(true);
  const filteredDevices = showOfflineDevices
    ? allDevices
    : allDevices.filter((device) => {
        if (typeof device === "string") {
          return false;
        }
        return device.isConnected;
      });
  // Find the target device
  useEffect(() => {
    const foundDevice = filteredDevices?.find((device) => {
      return device.deviceId === targetDevice.deviceId;
    });
    foundDevice && setTargetDevice(foundDevice);
  }, [setTargetDevice, filteredDevices, targetDevice]);

  return (
    <div>
      <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-900 text-gray-200">
        <header className="w-full px-4 py-3 border-b border-gray-700 flex justify-between items-center flex-shrink-0 backdrop-blur-sm bg-gray-900/80 sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/60 border border-gray-700/50 shadow-sm">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDashboardConnected ? "bg-green-400" : "bg-red-400"
                } shadow-lg shadow-${
                  isDashboardConnected ? "green" : "red"
                }-500/20`}
              />
              <span className="text-sm font-mono font-medium">
                {isDashboardConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            {filteredDevices.length === 0 && (
              <span className="text-sm font-mono text-gray-400 px-3 py-1.5 bg-gray-800/60 rounded-md border border-gray-700/30 shadow-sm">
                No devices available
              </span>
            )}
          </div>
          {/* Device selection and offline devices toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <button
                onClick={() => setShowOfflineDevices(!showOfflineDevices)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all duration-200"
                aria-pressed={showOfflineDevices}
                role="switch"
              >
                <div
                  className={`w-10 h-5 rounded-full flex items-center ${
                    showOfflineDevices ? "bg-blue-500/90" : "bg-gray-600/90"
                  } transition-colors duration-200 shadow-inner`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      showOfflineDevices ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
                <span className="text-sm font-medium">
                  Show offline devices
                </span>
              </button>
            </div>
            <DeviceSelection
              selectedDevice={targetDevice}
              setSelectedDevice={setTargetDevice}
              allDevices={filteredDevices}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="px-2 max-w-3xl mx-auto">
            {/* Device count and stats */}
            {filteredDevices.length > 0 && (
              <div className="mb-3 bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-lg transform transition-all duration-200 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-800/80 rounded-lg border border-gray-700/50">
                      <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                        <span className="text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                          {filteredDevices.length}
                        </span>
                        <span className="text-gray-400">
                          {filteredDevices.length === 1 ? "device" : "devices"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-green-900/20 rounded-lg border border-green-900/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-green-300 font-medium">
                          {allDevices.filter((d) => d.isConnected).length}{" "}
                          online
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-red-900/20 rounded-lg border border-red-900/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span className="text-red-300 font-medium">
                          {allDevices.filter((d) => !d.isConnected).length}{" "}
                          offline
                        </span>
                      </div>
                    </div>
                  </div>

                  {targetDevice && (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-600/10 rounded-lg border border-blue-400/30 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 font-mono uppercase tracking-wide">
                          Target
                        </span>
                      </div>
                      <span className="text-sm text-blue-100 font-medium">
                        {targetDevice.deviceId === "All"
                          ? "All Devices"
                          : targetDevice.deviceName}
                      </span>
                      {targetDevice.deviceId !== "All" &&
                        targetDevice.platform && (
                          <span
                            className={`flex items-center ${getPlatformColor(
                              targetDevice.platform
                            )}`}
                          >
                            <PlatformIcon platform={targetDevice.platform} />
                          </span>
                        )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Always show all devices */}
            {filteredDevices.map((device) => (
              <UserInfo
                key={device.id}
                userData={device}
                isTargeted={
                  targetDevice.deviceId === "All" ||
                  targetDevice.deviceId === device.deviceId
                }
                
              />
            ))}
          </div>
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </div>
  );
};
