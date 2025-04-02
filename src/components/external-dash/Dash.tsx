import React, { useEffect, useState } from "react";
import { User } from "./types/User";
import "../../index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools/production";

import { DeviceSelection } from "./DeviceSelection";
import { UserInfo } from "./UserInfo";
import { useSyncQueriesWeb } from "./useSyncQueriesWeb";
import { Socket } from "socket.io-client";
interface DashProps {
  allDevices: User[];
  isDashboardConnected: boolean;
  socket: Socket;
}
export const Dash: React.FC<DashProps> = ({
  isDashboardConnected,
  socket,
  allDevices,
}) => {
  const [targetDeviceName, setTargetDeviceName] = useState(
    "Please select a user"
  );
  const [targetDevice, setTargetDevice] = useState<User>();
  const [showOfflineDevices, setShowOfflineDevices] = useState(true);
  const filteredDevices = showOfflineDevices
    ? allDevices
    : allDevices.filter((device) => device.isConnected);
  // Find the target device
  useEffect(() => {
    const foundDevice = filteredDevices?.find(
      (device) => device.deviceName === targetDeviceName
    );
    setTargetDevice(foundDevice);
  }, [setTargetDevice, filteredDevices, targetDeviceName]);

  useSyncQueriesWeb({ targetDeviceName, socket });

  return (
    <div>
      <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-900 text-gray-200">
        <header className="w-full px-4 py-3 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            {filteredDevices.length > 0 && (
              <>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isDashboardConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span className="text-sm font-mono">
                  {isDashboardConnected ? "Connected" : "Disconnected"}
                  {targetDevice && ` - Targeting: ${targetDevice.deviceName}`}
                </span>
              </>
            )}
            {filteredDevices.length === 0 && (
              <span className="text-sm font-mono text-gray-400">
                No devices available
              </span>
            )}
          </div>
          {/* Device selection and offline devices toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOfflineDevices}
                onChange={() => setShowOfflineDevices(!showOfflineDevices)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded"
              />
              <span className="ml-2 text-sm">Show offline devices</span>
            </label>
            <DeviceSelection
              selectedUser={targetDeviceName}
              setSelectedUser={setTargetDeviceName}
              allDevices={filteredDevices}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="px-2 max-w-3xl mx-auto">
            {/* Device count and stats */}
            {filteredDevices.length > 0 && (
              <div className="text-gray-400 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    Showing {filteredDevices.length}{" "}
                    {showOfflineDevices ? "" : "connected"}{" "}
                    {filteredDevices.length === 1 ? "device" : "devices"}
                    {showOfflineDevices && (
                      <span>
                        {" "}
                        ({
                          filteredDevices.filter((d) => d.isConnected).length
                        }{" "}
                        online,{" "}
                        {filteredDevices.filter((d) => !d.isConnected).length}{" "}
                        offline)
                      </span>
                    )}
                  </div>
                  <div>
                    {targetDeviceName !== "All" && targetDevice && (
                      <span className="text-blue-400 font-medium">
                        Targeting: {targetDevice.deviceName}
                      </span>
                    )}
                    {targetDeviceName === "All" && (
                      <span className="text-blue-400 font-medium">
                        Targeting: All Devices
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Always show all devices */}
            {filteredDevices.map((device) => (
              <UserInfo
                key={device.id}
                userData={device}
                isTargeted={
                  targetDeviceName === "All" ||
                  targetDeviceName === device.deviceName
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
