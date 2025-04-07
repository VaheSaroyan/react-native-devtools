import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { SERVER_PORT, SOCKET_CONFIG } from "./config";
import socketHandle from "./server/socketHandle";
// Import Electron modules for error messages
import { dialog, app as electronApp } from "electron";

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
    const serverInstance = server.listen(SERVER_PORT, () => {
      console.log(`Socket.IO server running on port ${SERVER_PORT}`);
    });

    // Add error handler for server
    serverInstance.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${SERVER_PORT} is already in use. Please close the application using this port or change the port in config.ts.`
        );

        // Close server resources to avoid hanging
        try {
          io.close();
          serverInstance.close();
        } catch (closeError) {
          console.error("Error closing server resources:", closeError);
        }

        // If running in Electron, show a dialog
        try {
          dialog.showErrorBox(
            "Port Already in Use",
            `Cannot start server: Port ${SERVER_PORT} is already in use.\n\nPlease close any other instances of this application.`
          );

          // Optionally exit the application
          electronApp.exit(1);
        } catch (dialogError) {
          // If dialog module can't be loaded (not in Electron context), just log to console
          console.error("Failed to show error dialog:", dialogError);
        }
      } else {
        console.error("Server error:", error);
      }
    });

    return { io, server: serverInstance };
  } catch (error) {
    console.error("Error starting server:", error);
    throw error;
  }
};

// Export io instance for use in other files
export { io };
