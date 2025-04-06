import React, { useEffect, useState } from "react";
import { User } from "./types/User";
import "../../index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools/production";

import { DeviceSelection } from "./DeviceSelection";
import { UserInfo } from "./UserInfo";
import { LogConsole } from "./LogConsole";

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
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

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
        <header className="w-full px-3 py-2 border-b border-gray-700/50 flex justify-between items-center flex-shrink-0 backdrop-blur-md bg-gradient-to-b from-gray-900/95 to-gray-900/90 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md bg-opacity-60 border shadow-sm transition-colors duration-200 ${
                isDashboardConnected
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="relative">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDashboardConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-full ${
                      isDashboardConnected ? "bg-green-400" : "bg-red-400"
                    } animate-ping opacity-75`}
                  ></div>
                </div>
              </div>
              <span
                className={`text-xs font-medium ${
                  isDashboardConnected ? "text-green-300" : "text-red-300"
                }`}
              >
                {isDashboardConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Offline Toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setShowOfflineDevices(!showOfflineDevices)}
                className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-200 hover:bg-gray-800/40 border border-transparent hover:border-gray-700/50"
                aria-pressed={showOfflineDevices}
                role="switch"
              >
                <div
                  className={`w-7 h-3.5 rounded-full flex items-center transition-all duration-200 ${
                    showOfflineDevices ? "bg-blue-500/80" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-white shadow-sm transform transition-all duration-200 ${
                      showOfflineDevices ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300">
                  Show Offline Devices
                </span>
              </button>
            </div>

            {/* Separator */}
            <div className="h-4 w-px bg-gray-700/50"></div>

            {/* Device Selection */}
            <div className="flex-shrink-0">
              <DeviceSelection
                selectedDevice={targetDevice}
                setSelectedDevice={setTargetDevice}
                allDevices={filteredDevices}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-72">
          <div className="px-2 max-w-3xl mx-auto">
            {/* Device count and stats */}
            {filteredDevices.length > 0 ? (
              <>
                <div className="mb-3 bg-gradient-to-r from-gray-800/95 to-gray-800/90 border border-gray-700/60 rounded-xl p-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm flex items-center gap-2 px-2.5 py-1 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <span className="text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 text-xs">
                          {filteredDevices.length}
                        </span>
                        <span className="text-gray-300 font-medium">
                          {filteredDevices.length === 1 ? "device" : "devices"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-green-900/20 rounded-lg border border-green-900/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
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
                      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/70 transition-all duration-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-2 ${
                              targetDevice.deviceId === "All"
                                ? "text-blue-300"
                                : targetDevice.isConnected
                                ? "text-green-300"
                                : "text-red-300"
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                              Target
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-200">
                            {targetDevice.deviceId === "All"
                              ? "All Devices"
                              : targetDevice.deviceName}
                          </span>
                        </div>
                        {targetDevice.deviceId !== "All" &&
                          targetDevice.platform && (
                            <div
                              className={`flex items-center ${getPlatformColor(
                                targetDevice.platform
                              )}`}
                            >
                              <PlatformIcon platform={targetDevice.platform} />
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Device List */}
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm max-w-md">
                  <svg
                    className="w-12 h-12 text-gray-500 mx-auto mb-4"
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
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    No Devices Connected
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Please ensure this app is running and then start or restart
                    your devices to establish a connection.
                  </p>
                  <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                    <p className="font-medium mb-1">Troubleshooting steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-left">
                      <li>Verify the app is running</li>
                      <li>Restart your development devices</li>
                      <li className="flex items-start gap-1 flex-wrap">
                        <span>Please read the</span>
                        <button
                          onClick={() =>
                            handleCopy(
                              "https://github.com/LovesWorking/rn-better-dev-tools",
                              "Documentation"
                            )
                          }
                          className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer inline-flex items-center gap-1 relative group"
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
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-xs text-gray-200 rounded shadow-lg border border-gray-700/50">
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
                          className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer inline-flex items-center gap-1 relative group"
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
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-xs text-gray-200 rounded shadow-lg border border-gray-700/50">
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
            )}
          </div>
        </main>

        {/* Add LogConsole */}
        <LogConsole />
        <div className="fixed bottom-16 right-4 z-50">
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom"
            buttonPosition="relative"
          />
        </div>
      </div>
    </div>
  );
};
