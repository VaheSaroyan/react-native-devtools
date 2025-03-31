/**
 * Socket.IO Test Client Config
 * CommonJS version for use with the test script
 */

// Server configuration
const SERVER_PORT = 42831; // Using an uncommon port to avoid conflicts

// Client configuration
const CLIENT_URL = `http://localhost:${SERVER_PORT}`;

module.exports = {
  SERVER_PORT,
  CLIENT_URL,
};
