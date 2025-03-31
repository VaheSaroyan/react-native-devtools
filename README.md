# React Native DevTools

Enhanced developer tools for React Native applications (currently supporting React Query DevTools).

![React Native DevTools](https://via.placeholder.com/800x450.png?text=React+Native+DevTools)

## Features

- Connect to React Native applications over network
- React Query DevTools integration
- Real-time updates via Socket.IO
- Cross-platform Electron application (macOS, Windows, Linux)
- Clean, modern UI

## Installation

### Download Pre-built Binaries

Download the latest release from the [Releases page](https://github.com/your-username/rn-better-dev-tools/releases).

### Build from Source

```bash
# Clone the repository
git clone https://github.com/your-username/rn-better-dev-tools.git
cd rn-better-dev-tools

# Install dependencies
pnpm install

# Start in development mode
pnpm start

# Package the application
pnpm run make
```

## Usage

1. Launch the React Native DevTools application
2. Connect your React Native application by:
   - Add Socket.IO client to your React Native app
   - Configure it to connect to the DevTools server
   - See below for integration instructions

## Integrating with Your React Native App

Add the required dependencies to your React Native project:

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

Then, in your React Native app:

```javascript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import io from "socket.io-client";

// Create a query client
const queryClient = new QueryClient();

// Connect to DevTools
const socket = io("http://YOUR_COMPUTER_IP:42831");

// Add React Query DevTools integration
if (__DEV__) {
  // Initialize devtools connection
  socket.on("connect", () => {
    console.log("Connected to React Native DevTools");

    // Send React Query client state
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      socket.emit("reactQueryState", {
        type: "cache",
        data: queryClient.getQueryCache().getAll(),
      });
    });
  });
}

// In your app component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app content */}
    </QueryClientProvider>
  );
}
```

## Configuration

The application uses a centralized configuration:

- Server port: Defaults to 42831
- Socket.IO settings: Configured for cross-origin support

To change the server port, update it in the configuration files:

```typescript
// In src/config.ts
export const SERVER_PORT = 9876; // Change to your desired port
```

## Building and Publishing

See [RELEASE.md](./RELEASE.md) for detailed instructions on building and publishing.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
