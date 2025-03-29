import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { CLIENT_URL } from "../config";

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    // Connect to the Socket.IO server using the URL from config
    const socketClient = io(CLIENT_URL);

    socketClient.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setConnected(true);
      setSocket(socketClient);
    });

    socketClient.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setConnected(false);
    });

    // Listen for 'message' events
    socketClient.on("message", (data) => {
      console.log("Received message:", data);
      setMessages((prev) => [...prev, data]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socketClient.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (socket && inputMessage.trim() !== "") {
      socket.emit("message", inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
          Socket.IO Client
        </h1>

        <div className="mb-4 text-center">
          <span
            className={`inline-block px-3 py-1 rounded-full text-white ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 mb-4 h-64 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Messages</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500 italic">No messages received yet...</p>
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

        <div className="flex mb-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!connected || inputMessage.trim() === ""}
            className={`px-4 py-2 rounded-r ${
              connected && inputMessage.trim() !== ""
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>

        <p className="text-gray-700 text-center text-sm">
          Server status:{" "}
          {connected ? `Running on ${CLIENT_URL}` : "Not connected"}
        </p>
      </div>
    </div>
  );
};
