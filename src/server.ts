import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { SERVER_PORT, SOCKET_CONFIG } from "./config";

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.IO server using config
const io = new Server(server, SOCKET_CONFIG);

// Setup Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send a welcome message to the connected client
  socket.emit("message", `Welcome! You are connected with ID: ${socket.id}`);

  // Listen for message events from clients
  socket.on("message", (data) => {
    try {
      console.log(`Received message from ${socket.id}: ${data}`);

      // Broadcast the message to all clients
      io.emit("message", data);
    } catch (error) {
      console.error(`Error handling message from ${socket.id}:`, error);
      socket.emit("error", "Error processing your message");
    }
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error for client ${socket.id}:`, error);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Serve static files if needed
app.use(express.static(path.join(__dirname, "../build")));

// Handle root route
app.get("/", (req: Request, res: Response) => {
  res.send(`Socket.IO server is running on port ${SERVER_PORT}`);
});

// Start server
export const startServer = () => {
  try {
    server.listen(SERVER_PORT, () => {
      console.log(`Socket.IO server running on port ${SERVER_PORT}`);
    });

    return { io, server };
  } catch (error) {
    console.error("Error starting server:", error);
    throw error;
  }
};

// Export io instance for use in other files
export { io };
