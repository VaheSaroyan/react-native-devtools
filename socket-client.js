/**
 * Socket.IO Test Client
 *
 * This simple client connects to the Socket.IO server and allows
 * sending messages from the command line.
 */

// We need to use CommonJS require for this standalone script
const { io } = require("socket.io-client");

// Import config values from CommonJS config file
const { CLIENT_URL } = require("./config.js");

console.log("Starting Socket.IO test client...");
console.log(`Connecting to: ${CLIENT_URL}`);

// Connect to the Socket.IO server
const socket = io(CLIENT_URL);

// Event handler for successful connection
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");
  console.log("Socket ID:", socket.id);

  // Send a test message after connection
  setTimeout(() => {
    sendMessage("Hello from test client!");
  }, 1000);
});

// Event handler for disconnection
socket.on("disconnect", () => {
  console.log("❌ Disconnected from Socket.IO server");
});

// Event handler for connection errors
socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});

// Event handler for receiving messages
socket.on("message", (data) => {
  console.log(`📨 Received: "${data}"`);
});

// Add handler for query-action events
socket.on("query-action", (data) => {
  console.log(`📨 Received query-action:`, data);
});

// Function to send a message
function sendMessage(message) {
  socket.emit("message", message);
  console.log(`📤 Sent: "${message}"`);
}

// Allow sending messages from the command line
process.stdin.on("data", (data) => {
  const message = data.toString().trim();
  if (message) {
    sendMessage(message);
  }
});

console.log("Type messages and press Enter to send. Press Ctrl+C to exit.");
