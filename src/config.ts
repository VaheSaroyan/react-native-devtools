/**
 * Application configuration settings
 */

// Server configuration
export const SERVER_PORT = 42831;

// Socket.IO configuration
export const SOCKET_CONFIG = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  // Fix typing issue with transports
  transports: ["websocket", "polling"] as any, // Type assertion to avoid TypeScript error
  pingTimeout: 30000,
  pingInterval: 25000,
};

// Client configuration
export const CLIENT_URL = `http://localhost:${SERVER_PORT}`;
