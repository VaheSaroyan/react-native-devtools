# Simple Socket.IO Chat Application

A basic Electron application with integrated Socket.IO server for real-time messaging.

## Features

- Electron desktop application with clean UI
- Built-in Socket.IO server for real-time communication
- React front-end with Tailwind CSS
- Simple message broadcasting system
- Centralized configuration for easy port changes

## Installation

```bash
# Install dependencies
pnpm install
```

## Running the Application

```bash
# Start the Electron app with Socket.IO server
pnpm start
```

The application will:

1. Start a Socket.IO server on the configured port (default: 42831)
2. Launch the Electron application window
3. Allow sending and receiving messages in real-time

## Configuration

The application uses a centralized configuration approach for easy modification:

- **Main config**: `src/config.ts` - Used by the TypeScript application code
- **Test client config**: `config.js` - CommonJS version for the test client

To change the server port, update it in both config files:

1. In `src/config.ts`:

   ```typescript
   export const SERVER_PORT = 9876; // Change to your desired port
   ```

2. In `config.js`:
   ```javascript
   const SERVER_PORT = 9876; // Change to match the value in src/config.ts
   ```

## Testing

See [POSTMAN_TESTING.md](./POSTMAN_TESTING.md) for instructions on testing with Postman or the provided test client.

Quick test with the Node.js client:

```bash
node socket-client.js
```

## Project Structure

- `src/config.ts` - Centralized configuration (TypeScript)
- `config.js` - Centralized configuration (CommonJS for test client)
- `src/main.ts` - Electron main process and Socket.IO server startup
- `src/server.ts` - Simple Socket.IO server implementation
- `src/components/App.tsx` - React client UI
- `socket-client.js` - Test client for Socket.IO server

## Socket.IO Implementation

The Socket.IO server is implemented with a simple approach and centralized configuration:

```javascript
// Import config
import { SERVER_PORT, SOCKET_CONFIG } from "./config";

// Create server
const app = express();
const server = http.createServer(app);
const io = new Server(server, SOCKET_CONFIG);

// Handle connections
io.on("connection", (socket) => {
  // Listen for messages
  socket.on("message", (data) => {
    // Broadcast to all clients
    io.emit("message", data);
  });
});

// Start server using port from config
server.listen(SERVER_PORT);
```
