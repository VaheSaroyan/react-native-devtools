import React, { useState, useRef, useEffect } from "react";
import { User } from "./types/User";

interface Props {
  selectedDevice: User;
  setSelectedDevice: (device: User) => void;
  allDevices?: User[];
}

interface DeviceOption {
  value: string;
  label: string;
  disabled?: boolean;
  isOffline?: boolean;
  platform?: string;
}

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  const normalizedPlatform = platform?.toLowerCase() || "";

  switch (normalizedPlatform) {
    case "ios":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      );
    case "android":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.61 15.15c-.46 0-.84-.37-.84-.83s.37-.83.84-.83.83.37.83.83-.37.83-.83.83m-9.22 0c-.46 0-.83-.37-.83-.83s.37-.83.83-.83.84.37.84.83-.37.83-.84.83m9.42-5.89l1.67-2.89c.09-.17.03-.38-.13-.47-.17-.09-.38-.03-.47.13l-1.69 2.93A9.973 9.973 0 0012 7.75c-1.89 0-3.63.52-5.19 1.37L5.12 6.19c-.09-.17-.3-.22-.47-.13-.17.09-.22.3-.13.47l1.67 2.89C3.44 11.15 1.62 14.56 1.62 18h20.76c0-3.44-1.82-6.85-4.57-8.74z" />
        </svg>
      );
    case "web":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2m-5.15 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56M14.34 14H9.66c-.1-.66-.16-1.32-.16-2 0-.68.06-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2M12 19.96c-.83-1.2-1.5-2.53-1.91-3.96h3.82c-.41 1.43-1.08 2.76-1.91 3.96M8 8H5.08A7.923 7.923 0 019.4 4.44C8.8 5.55 8.35 6.75 8 8m-2.92 8H8c.35 1.25.8 2.45 1.4 3.56A8.008 8.008 0 015.08 16m-.82-2C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2M12 4.03c.83 1.2 1.5 2.54 1.91 3.97h-3.82c.41-1.43 1.08-2.77 1.91-3.97M18.92 8h-2.95a15.65 15.65 0 00-1.38-3.56c1.84.63 3.37 1.9 4.33 3.56M12 2C6.47 2 2 6.5 2 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z" />
        </svg>
      );
    case "tv":
    case "tvos":
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 17H3V5h18m0-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
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

export const DeviceSelection: React.FC<Props> = ({
  selectedDevice,
  setSelectedDevice,
  allDevices = [],
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate user options based on available users
  const deviceOptions: DeviceOption[] = (() => {
    if (allDevices?.length === 0) {
      // No users available
      return [{ value: "", label: "No devices available", disabled: true }];
    } else if (allDevices?.length === 1) {
      // Only one user, no need for "All" option
      const device = allDevices[0];
      return [
        {
          value: device.deviceId,
          label: device.deviceName || "Unknown Device Name",
          isOffline: !device.isConnected,
          platform: device.platform,
        },
      ];
    } else {
      // Multiple users, include "All" option
      return [
        { value: "All", label: "All Devices" },
        ...allDevices.map((device) => ({
          value: device.deviceId,
          label: device.deviceName || "Unknown Device Name",
          isOffline: !device.isConnected,
          platform: device.platform,
        })),
      ];
    }
  })();

  // Update selectedDevice based on the number of available devices
  useEffect(() => {
    // Skip if no devices are available but we already have the placeholder set
    if (allDevices?.length === 0) {
      if (selectedDevice.deviceId !== "No devices available") {
        // No users available
        setSelectedDevice({
          deviceId: "No devices available",
          deviceName: "No devices available",
          isConnected: false,
          id: "No devices available",
        });
      }
    } else if (allDevices?.length === 1) {
      // Exactly one user available, auto-select it if not already selected
      if (selectedDevice.deviceId !== allDevices[0].deviceId) {
        setSelectedDevice(allDevices[0]);
      }
    } else if (allDevices?.length > 1) {
      // Multiple users available
      if (selectedDevice === null || !selectedDevice) {
        // If no valid selection, default to "All"
        setSelectedDevice({
          deviceId: "All",
          deviceName: "All",
          isConnected: false,
          id: "All",
        });
      } else {
        // Check if the current selection is still valid
        const isValidSelection =
          selectedDevice.deviceId === "All" ||
          allDevices.some(
            (device) => device.deviceId === selectedDevice.deviceId
          );

        if (!isValidSelection) {
          setSelectedDevice({
            deviceId: "All",
            deviceName: "All",
            isConnected: false,
            id: "All",
          });
        }
      }
    }
    // Remove selectedDevice from dependency array to prevent infinite loops
  }, [allDevices, setSelectedDevice]);

  return (
    <div className="relative w-72" ref={dropdownRef}>
      <div
        className={`w-full px-3 py-2.5 bg-gray-800/80 text-gray-200 backdrop-blur-sm border select-none
                  ${
                    isOpen
                      ? "border-blue-500/50 ring-2 ring-blue-500/20"
                      : "border-gray-700/70"
                  } 
                  rounded-md shadow-md hover:shadow-lg transition-all duration-200 
                  text-sm font-mono flex justify-between items-center gap-2
                  ${
                    allDevices?.length > 0
                      ? "cursor-pointer hover:border-gray-600"
                      : "cursor-not-allowed opacity-80"
                  }`}
        onClick={() => allDevices?.length > 0 && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 truncate flex-1">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              selectedDevice.deviceId === "No devices available"
                ? "bg-gray-500"
                : selectedDevice.deviceId === "All"
                ? "bg-blue-500"
                : selectedDevice.isConnected
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          ></div>
          <span className="truncate font-medium flex items-center gap-2">
            {selectedDevice.deviceId === "No devices available" ? (
              "No devices available"
            ) : selectedDevice.deviceId === "All" ? (
              "Target: All Devices"
            ) : (
              <>
                Target: {selectedDevice.deviceName}
                {selectedDevice.platform && (
                  <span
                    className={`flex items-center gap-1 ${getPlatformColor(
                      selectedDevice.platform
                    )}`}
                  >
                    <PlatformIcon platform={selectedDevice.platform} />
                  </span>
                )}
              </>
            )}
          </span>
        </div>
        {allDevices?.length > 0 && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-400" : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>

      {isOpen && (
        <div
          className="absolute mt-1.5 w-full rounded-md bg-gray-800/95 backdrop-blur-sm 
                    border border-gray-700 shadow-lg z-50 max-h-64 overflow-auto
                    transition-all duration-200 ring-2 ring-blue-500/10"
        >
          <div
            className="sticky top-0 px-4 py-2.5 text-xs text-gray-300 border-b border-gray-700 select-none
                        font-medium bg-gray-800/90 backdrop-blur-md z-10 flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5 text-blue-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
              <span className="text-blue-200">Select device to target</span>
            </div>
          </div>
          <div className="py-1">
            {deviceOptions.map((option, index) => (
              <div
                key={index}
                className={`px-4 py-2.5 text-sm font-mono select-none
                          hover:bg-gray-700/80 hover:backdrop-blur-sm transition-colors duration-150
                          cursor-pointer border-l-2 
                          ${
                            option.disabled
                              ? "opacity-50 cursor-not-allowed border-transparent"
                              : selectedDevice.deviceId === option.value
                              ? "bg-gray-700/70 border-blue-500"
                              : "border-transparent"
                          } 
                          ${option.isOffline ? "text-gray-400" : ""}`}
                onClick={() => {
                  if (!option.disabled) {
                    // If ALL set to all
                    if (option.value === "All") {
                      setSelectedDevice({
                        deviceId: "All",
                        deviceName: "All",
                        isConnected: false,
                        id: "All",
                      });
                      setIsOpen(false); // Close dropdown when selecting All
                    } else {
                      // Otherwise, find the device and select it
                      const device = allDevices.find(
                        (device) => device.deviceId === option.value
                      );
                      if (device) {
                        setSelectedDevice(device);
                        setIsOpen(false);
                      } else {
                        console.error(
                          "Device selection not found",
                          option.value,
                          allDevices
                        );
                      }
                    }
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {option.value === "All" ? (
                    <div className="relative flex-shrink-0">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    </div>
                  ) : option.isOffline ? (
                    <span className="relative flex-shrink-0">
                      <span className="flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    </span>
                  ) : (
                    <span className="relative flex-shrink-0">
                      <span className="flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    </span>
                  )}
                  <span
                    className={`flex items-center gap-2 ${
                      selectedDevice.deviceId === option.value
                        ? "font-medium text-blue-300"
                        : ""
                    }`}
                  >
                    {option.label}
                    {option.platform && (
                      <span
                        className={`flex items-center ${getPlatformColor(
                          option.platform
                        )}`}
                      >
                        <PlatformIcon platform={option.platform} />
                      </span>
                    )}
                  </span>
                  {selectedDevice.deviceId === option.value && (
                    <svg
                      className="ml-auto h-4 w-4 text-blue-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
