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
  const { users, isConnected, socket } = useConnectedUsers({
    query: {
      deviceName: "Dashboard",
    },
    socketURL: CLIENT_URL,
  });
  const [username, setUsername] = useState("Please select a user");
  const [currentUser, setCurrentUser] = useState<User>();
  const [clientUsers, setClientUsers] = useState<User[]>([]);

  useEffect(() => {
    const foundUser = users.find((user) => user.deviceName === username);
    setCurrentUser(foundUser);
  }, [setCurrentUser, users, username]);

  useEffect(() => {
    setClientUsers(users.filter((user) => user.deviceName !== "Dashboard"));
  }, [users]);

  return (
    <Providers
      setDevices={setClientUsers}
      selectedDevice={username}
      socket={socket}
    >
      <div className="flex flex-col w-full h-full bg-gray-900 text-gray-200">
        <header className="w-full px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-sm font-mono">
              {isConnected ? "Connected" : "Disconnected"}
              {currentUser && ` - ${currentUser.deviceName}`}
            </span>
          </div>
          <DeviceSelection
            selectedUser={username}
            setSelectedUser={setUsername}
            users={clientUsers}
          />
        </header>
        <main className="flex-1 p-4 overflow-auto">
          {/* Show selected user info */}
          {currentUser && <UserInfo userData={currentUser} />}

          {/* Show all users if "All" is selected */}
          {username === "All" &&
            clientUsers.map((user) => (
              <UserInfo key={user.id} userData={user} />
            ))}
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </Providers>
  );
};
