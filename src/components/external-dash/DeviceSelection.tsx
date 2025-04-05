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
        },
      ];
    } else {
      // Multiple users, include "All" option
      return [
        { value: "All", label: "Target All Devices" },
        ...allDevices.map((device) => ({
          value: device.deviceId,
          label: device.deviceName || "Unknown Device Name",
          isOffline: !device.isConnected,
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
    <div className="relative w-64" ref={dropdownRef}>
      <div
        className={`w-full p-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-md 
                shadow-sm focus:outline-none text-sm font-mono flex justify-between items-center ${
                  allDevices?.length > 0
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-80"
                }`}
        onClick={() => allDevices?.length > 0 && setIsOpen(!isOpen)}
      >
        <span className="truncate mr-2">
          {selectedDevice.deviceId === "No devices available"
            ? "No devices available"
            : selectedDevice.deviceId === "All"
            ? "Target: All Devices"
            : `Target: ${selectedDevice.deviceName}`}
        </span>
        {allDevices?.length > 0 && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-3 h-3 text-gray-400 flex-shrink-0"
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
          className="absolute mt-1 w-full rounded-md bg-gray-800 border border-gray-700 shadow-lg z-50 max-h-60 overflow-auto"
          style={{ position: "absolute", top: "100%", left: 0 }}
        >
          <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
            Select device to target
          </div>
          {deviceOptions.map((option, index) => (
            <div
              key={index}
              className={`px-4 py-2 text-sm font-mono hover:bg-gray-700 cursor-pointer ${
                option.disabled ? "opacity-50 cursor-not-allowed" : ""
              } ${
                selectedDevice.deviceId === option.value ? "bg-gray-700" : ""
              } ${option.isOffline ? "text-gray-400" : ""}`}
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
              <div className="flex items-center">
                {option.isOffline && (
                  <span className="mr-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {!option.isOffline && option.value !== "All" && (
                  <span className="mr-2 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                {option.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
