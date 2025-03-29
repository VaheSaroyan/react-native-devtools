import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { SERVER_PORT, SOCKET_CONFIG } from "./config";
import socketHandle from "./server/socketHandle";

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.IO server using config
const io = new Server(server, SOCKET_CONFIG);
socketHandle({ io });

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
