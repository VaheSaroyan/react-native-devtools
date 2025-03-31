import React, { useEffect, useState } from "react";
import { CLIENT_URL } from "../config";
import useConnectedUsers from "./_hooks/useConnectedUsers";
import { User } from "../types/User";
import "../index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { DeviceSelection } from "./DeviceSelection";
import { UserInfo } from "./UserInfo";
import Providers from "./external-dash/providers";

export const App: React.FC = () => {
  const { users, allDevices, isConnected, socket } = useConnectedUsers({
    query: {
      deviceName: "Dashboard",
    },
    socketURL: CLIENT_URL,
  });
  const [targetDeviceName, setTargetDeviceName] = useState(
    "Please select a user"
  );
  const [targetDevice, setTargetDevice] = useState<User>();
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [showOfflineDevices, setShowOfflineDevices] = useState(true);
  const [filteredDevices, setFilteredDevices] = useState<User[]>([]);

  useEffect(() => {
    // Find user in either currently connected or all devices
    const foundUser =
      users.find((user) => user.deviceName === targetDeviceName) ||
      allDevices?.find((user) => user.deviceName === targetDeviceName);
    setTargetDevice(foundUser);
  }, [setTargetDevice, users, allDevices, targetDeviceName]);

  useEffect(() => {
    // Filter out dashboard from connected users
    setClientUsers(users.filter((user) => user.deviceName !== "Dashboard"));
  }, [users]);

  useEffect(() => {
    // Filter devices based on showOfflineDevices setting
    if (!allDevices) {
      setFilteredDevices(clientUsers);
      return;
    }

    if (showOfflineDevices) {
      // Show both online and offline devices
      setFilteredDevices(
        allDevices.filter((device) => device.deviceName !== "Dashboard")
      );
    } else {
      // Show only online devices
      setFilteredDevices(clientUsers);
    }
  }, [allDevices, clientUsers, showOfflineDevices]);

  return (
    <Providers
      setDevices={setClientUsers}
      selectedDevice={targetDeviceName}
      socket={socket}
    >
      <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-900 text-gray-200">
        <header className="w-full px-4 py-3 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            {filteredDevices.length > 0 && (
              <>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span className="text-sm font-mono">
                  {isConnected ? "Connected" : "Disconnected"}
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
              users={clientUsers}
              allDevices={allDevices || []}
              showOfflineDevices={showOfflineDevices}
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
            {filteredDevices.map((user) => (
              <UserInfo
                key={user.id}
                userData={user}
                isTargeted={
                  targetDeviceName === "All" ||
                  targetDeviceName === user.deviceName
                }
              />
            ))}
          </div>
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </Providers>
  );
};
