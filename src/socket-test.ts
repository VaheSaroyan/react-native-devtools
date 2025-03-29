// Simple test script to send messages to the Socket.IO server
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

// Connect to the server
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");

  // Send a test message
  sendTestMessage();
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

// Function to send a test message
function sendTestMessage() {
  const message =
    "Hello from test client at " + new Date().toLocaleTimeString();
  console.log("Sending message:", message);

  socket.emit("message", message);
}

// Send a new message every 5 seconds
setInterval(sendTestMessage, 5000);

console.log("Test client started. Press Ctrl+C to exit.");
