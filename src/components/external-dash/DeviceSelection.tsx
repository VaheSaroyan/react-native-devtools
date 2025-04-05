import React, { useState, useRef, useEffect } from "react";
import { User } from "./types/User";
import {
  PlatformIcon,
  getPlatformTextColor,
  getDisplayPlatform,
} from "./utils/platformUtils";

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
                    className={`flex items-center ${getPlatformTextColor(
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
                    if (option.value === "All") {
                      setSelectedDevice({
                        deviceId: "All",
                        deviceName: "All",
                        isConnected: false,
                        id: "All",
                      });
                      setIsOpen(false);
                    } else {
                      const device = allDevices.find(
                        (device) => device.deviceId === option.value
                      );
                      if (device) {
                        setSelectedDevice(device);
                        setIsOpen(false);
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
                        className={`flex items-center ${getPlatformTextColor(
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
