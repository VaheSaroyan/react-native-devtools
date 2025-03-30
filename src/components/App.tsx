import React, { useEffect, useState } from "react";
import { CLIENT_URL } from "../config";
import useConnectedUsers from "./_hooks/useConnectedUsers";
import { User } from "../types/User";
import "../index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Providers from "../providers";
import { DeviceSelection } from "./DeviceSelection";
import { UserInfo } from "./UserInfo";

export const App: React.FC = () => {
  const { users, isConnected, socket } = useConnectedUsers({
    query: {
      username: "Dashboard",
      userType: "dashboard",
      clientType: "server",
    },
    socketURL: CLIENT_URL,
  });
  const [username, setUsername] = useState("Please select a user");
  const [currentUser, setCurrentUser] = useState<User>();
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (socket && inputMessage.trim() !== "") {
      socket.emit("message", inputMessage);
      setInputMessage("");
    }
  };

  useEffect(() => {
    const foundUser = users.find((user) => user.username === username);
    setCurrentUser(foundUser);
  }, [setCurrentUser, users, username]);

  useEffect(() => {
    setClientUsers(users.filter((user) => user.clientType !== "server"));
  }, [users]);

  return (
    <Providers>
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
              {currentUser && ` - ${currentUser.username}`}
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

          {/* Message input section */}
          <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
            <div className="flex mb-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!isConnected || inputMessage.trim() === ""}
                className={`px-4 py-2 rounded-r ${
                  isConnected && inputMessage.trim() !== ""
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                Send
              </button>
            </div>

            {/* Connection status info */}
            <div className="flex items-center justify-between text-sm text-gray-400 font-mono">
              <span>
                {currentUser ? (
                  <span className="text-green-400">CONNECTED</span>
                ) : (
                  <span className="text-red-400">DISCONNECTED</span>
                )}
              </span>
              <span>
                {isConnected
                  ? `Server: ${CLIENT_URL}`
                  : "Server: Not connected"}
              </span>
            </div>
          </div>
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </Providers>
  );
};
