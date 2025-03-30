import React, { useEffect, useState } from "react";
import { CLIENT_URL } from "../config";
import useConnectedUsers from "./_hooks/useConnectedUsers";
import { User } from "../types/User";
import "../index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Providers from "../providers";

export const App: React.FC = () => {
  const { users, isConnected, socket } = useConnectedUsers({
    query: {
      username: "test",
      userType: "test",
      clientType: "client",
    },
    socketURL: CLIENT_URL,
  });
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState<User>();
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div
          className={`p-[1px] w-full p-6 rounded-lg shadow-md ${
            isConnected ? "bg-green-400" : "bg-red-400"
          }`}
        ></div>
        {/* Client Dashboard*/}
        <div className="flex flex-wrap">
          <div className="flex">
            <select
              value={username}
              disabled={!clientUsers.length}
              className="p-1 m-1 border-2 border-[#d0d5dd] shadow-lg rounded-md mx-3"
              onChange={(e) => {
                setUsername(e.target.value.trim());
              }}
            >
              {clientUsers.length ? (
                <option key="default" hidden value="">
                  Select a user
                </option>
              ) : (
                <option key="default" hidden value="">
                  No connected users
                </option>
              )}
              {clientUsers.map((user, index) => (
                <option
                  key={index + user.username}
                  value={user.username.toString()}
                >
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <p
            className={`ml-auto ${
              currentUser ? "bg-green-400" : "bg-red-400"
            } p-1 m-2 rounded-md text-sm mt-auto`}
          >
            {currentUser ? "CONNECTED" : "DISCONNECTED"}
          </p>
        </div>
        <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
          {/* Connection status */}
          <div className="mb-4 text-center">
            <span
              className={`inline-block px-3 py-1 rounded-full text-white ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {/* Messages */}
          <div className="border rounded-lg p-4 bg-gray-50 mb-4 h-64 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Messages</h2>
            {messages.length === 0 ? (
              <p className="text-gray-500 italic">
                No messages received yet...
              </p>
            ) : (
              <ul className="space-y-2">
                {messages.map((msg, index) => (
                  <li
                    key={index}
                    className="p-2 bg-white rounded border border-gray-200"
                  >
                    {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Input */}
          <div className="flex mb-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!isConnected || inputMessage.trim() === ""}
              className={`px-4 py-2 rounded-r ${
                isConnected && inputMessage.trim() !== ""
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Send
            </button>
          </div>
          {/* Server status */}
          <p className="text-gray-700 text-center text-sm">
            Server status:{" "}
            {isConnected ? `Running on ${CLIENT_URL}` : "Not connected"}
          </p>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </Providers>
  );
};
