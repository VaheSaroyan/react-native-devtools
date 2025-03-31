import { Socket, Server as SocketIOServer } from "socket.io";
// Replace the problematic import with a direct type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultEventsMap = Record<string, (...args: any[]) => void>;
import { User } from "../types/User";
import { SyncMessage } from "../components/external-dash/shared/types";
import {
  OnlineManagerMessage,
  QueryActionMessage,
  QueryRequestInitialStateMessage,
} from "../components/external-dash/useSyncQueriesWeb";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  io: SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}

/**
 * Global state for connected users and dashboard clients
 */
let users = [] as User[]; // Connected users
const allDevices = [] as User[]; // All devices that have ever connected (history)
let dashboardClients = [] as string[]; // Dashboard client IDs
// Map to track socketId to deviceId for reconnection handling
const deviceIdMap = new Map<string, string>();
// Map to track active socket connections by deviceId
const activeConnectionsMap = new Map<string, string>();

/**
 * Server-side socket handler that manages:
 * - Communication between devices and dashboard
 * - User connection tracking
 * - Query state synchronization
 * - Action forwarding
 */
export default function socketHandle({ io }: Props) {
  const LOG_PREFIX = "[SERVER]";

  /**
   * Handle client disconnection
   */
  function handleClose(id: string) {
    // Find user before removing for logging
    const user = users.find((user) => user.id === id);

    // Get the device ID from our map if it exists
    const deviceId = deviceIdMap.get(id);

    // Only remove from users array if there's no persistent device ID
    // or if there are no other connections with the same device ID
    if (
      !deviceId ||
      !users.some((u) => u.id !== id && u.deviceId === deviceId)
    ) {
      users = users.filter((user: User) => user.id !== id);

      console.log(
        `${LOG_PREFIX} Client disconnected - ID: ${id}, Name: ${
          user?.deviceName || "Unknown"
        } - Removing user record`
      );

      // Update the connection status in allDevices array
      if (deviceId) {
        const deviceIndex = allDevices.findIndex(
          (u) => u.deviceId === deviceId
        );
        if (deviceIndex !== -1) {
          allDevices[deviceIndex].isConnected = false;
          // Remove the active connection mapping
          activeConnectionsMap.delete(deviceId);
        }
      }
    } else {
      console.log(
        `${LOG_PREFIX} Client disconnected - ID: ${id}, Name: ${
          user?.deviceName || "Unknown"
        } - Keeping user record for same device with ID: ${deviceId}`
      );
    }

    // Remove from deviceIdMap
    deviceIdMap.delete(id);

    // Remove from dashboard clients if it exists
    const wasDashboard = dashboardClients.includes(id);
    dashboardClients = dashboardClients.filter((clientId) => clientId !== id);

    console.log(
      `${LOG_PREFIX} Client disconnected - ID: ${id}, Name: ${
        user?.deviceName || "Unknown"
      }, Was Dashboard: ${wasDashboard}`
    );

    // Sends new list of users to everyone connected
    io.emit("users-update", users);
    // Also send the complete device history list
    io.emit(
      "all-devices-update",
      allDevices.filter((device) => device.deviceName !== "Dashboard")
    );
    console.log(
      `${LOG_PREFIX} Updated users list: ${users
        .map((u) => u.deviceName)
        .join(", ")}`
    );
  }

  /**
   * Add a new user to the connected users list with unique naming
   */
  function addNewUser({ id, deviceName, deviceId, platform }: User) {
    // Check if we're reconnecting an existing device by deviceId
    if (deviceId) {
      // Store the mapping for future reference
      deviceIdMap.set(id, deviceId);
      // Track active connection
      activeConnectionsMap.set(deviceId, id);

      // Check if we already have a user with this deviceId
      const existingUserIndex = users.findIndex(
        (user) => user.deviceId === deviceId
      );

      // Check if this device is in our history
      const existingDeviceIndex = allDevices.findIndex(
        (device) => device.deviceId === deviceId
      );

      if (existingUserIndex !== -1) {
        console.log(
          `${LOG_PREFIX} Reconnecting existing device - ID: ${id}, Name: ${deviceName}, DeviceId: ${deviceId}, Platform: ${
            platform || "Unknown"
          }`
        );

        // Update the existing user with the new socket id and potentially new platform info
        users[existingUserIndex].id = id;
        if (platform) {
          users[existingUserIndex].platform = platform;
        }

        // Add isConnected status
        users[existingUserIndex].isConnected = true;

        // Update in history list too if it exists
        if (existingDeviceIndex !== -1) {
          allDevices[existingDeviceIndex].id = id;
          allDevices[existingDeviceIndex].isConnected = true;
          if (platform) {
            allDevices[existingDeviceIndex].platform = platform;
          }
        } else if (deviceName !== "Dashboard") {
          // Add to history if not yet present and not a dashboard
          allDevices.push({
            id,
            deviceName,
            deviceId,
            platform,
            isConnected: true,
          });
        }

        // Notify all clients of updated user list
        io.emit("users-update", users);
        io.emit(
          "all-devices-update",
          allDevices.filter((device) => device.deviceName !== "Dashboard")
        );
        console.log(
          `${LOG_PREFIX} Updated users list: ${users
            .map((u) => u.deviceName)
            .join(", ")}`
        );

        return;
      }
    }

    // Handle duplicate device names by adding incrementing numbers
    const extractNumber = (name: string) => {
      const match = name.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 1;
    };

    let highestNumber = 0;
    users.forEach((user) => {
      if (user.deviceName.startsWith(deviceName)) {
        const number = extractNumber(user.deviceName);
        if (number >= highestNumber) {
          highestNumber = number;
        }
      }
    });

    // Add a number suffix if this is a duplicate name
    if (highestNumber > 0) {
      deviceName = `${deviceName} #${highestNumber + 1}`;
    }

    // Add user to the list if ID is valid
    if (id) {
      // Create user object with connection status
      const newUser = {
        id: id,
        deviceName: deviceName,
        deviceId: deviceId,
        platform: platform,
        isConnected: true,
      };

      users.push(newUser);

      // Add to history if it's not a dashboard
      if (deviceName !== "Dashboard" && deviceId) {
        // Check if already in history
        const existingDeviceIndex = allDevices.findIndex(
          (device) => device.deviceId === deviceId
        );

        if (existingDeviceIndex !== -1) {
          // Update existing record
          allDevices[existingDeviceIndex] = { ...newUser };
        } else {
          // Add new device to history
          allDevices.push({ ...newUser });
        }
      }

      console.log(
        `${LOG_PREFIX} New user connected - ID: ${id}, Name: ${deviceName}${
          deviceId ? `, DeviceId: ${deviceId}` : ""
        }${platform ? `, Platform: ${platform}` : ""}`
      );

      // Check if this is a dashboard client
      if (deviceName === "Dashboard" && id) {
        dashboardClients.push(id);
        console.log(`${LOG_PREFIX} Registered dashboard client with ID: ${id}`);
      }

      // Notify all clients of updated user list
      io.emit("users-update", users);
      io.emit(
        "all-devices-update",
        allDevices.filter((device) => device.deviceName !== "Dashboard")
      );
      console.log(
        `${LOG_PREFIX} Updated users list: ${users
          .map((u) => u.deviceName)
          .join(", ")}`
      );
    }
  }

  // Helper to check if a device is currently connected
  function isDeviceConnected(deviceId: string | undefined): boolean {
    if (!deviceId) return false;
    return activeConnectionsMap.has(deviceId);
  }

  /**
   * Handle generic user messages (for debugging purposes)
   */
  function handleUserMessage(message: string, deviceName: string) {
    console.log(`${LOG_PREFIX} Message from ${deviceName}: ${message}`);
    io.emit("message", `Device ${deviceName} sent message: ${message}`);
  }

  /**
   * Forward query sync messages only to dashboard clients
   */
  function forwardQuerySyncToDashboards(message: SyncMessage) {
    if (dashboardClients.length === 0) {
      console.log(
        `${LOG_PREFIX} No dashboard clients connected to forward query sync to`
      );
      return;
    }

    console.log(
      `${LOG_PREFIX} Forwarding query sync from ${message.deviceName} to ${dashboardClients.length} dashboard(s)`
    );

    dashboardClients.forEach((dashboardId) => {
      io.to(dashboardId).emit("query-sync", message);
    });
  }

  /**
   * Helper function to find target user(s) and execute an action on them
   * @param targetDevice The target device name or "All"
   * @param action Function to execute on each target user
   * @param actionName Description of the action for logging
   */
  function withTargetUsers(
    targetDevice: string,
    action: (user: User) => void,
    actionName: string
  ) {
    if (targetDevice === "All") {
      console.log(`${LOG_PREFIX} Broadcasting ${actionName} to all devices`);
      // Broadcast to all non-dashboard clients
      const deviceUsers = users.filter(
        (user) => user.deviceName !== "Dashboard"
      );
      console.log(
        `${LOG_PREFIX} Sending to ${deviceUsers.length} devices: ${deviceUsers
          .map((u) => u.deviceName)
          .join(", ")}`
      );

      deviceUsers.forEach(action);
    } else {
      // Find the target device and send only to that device
      const targetUser = users.find((user) => user.deviceName === targetDevice);

      if (targetUser) {
        console.log(
          `${LOG_PREFIX} Sending to target device ${targetUser.deviceName} (${targetUser.id})`
        );
        action(targetUser);
      } else {
        console.log(`${LOG_PREFIX} Target device ${targetDevice} not found`);
      }
    }
  }

  // Main socket connection handler
  io.on("connection", (socket: Socket) => {
    // Get the query parameters from the handshake
    const { deviceName, deviceId, platform } = socket.handshake.query as {
      deviceName: string | undefined;
      deviceId: string | undefined;
      platform: string | undefined;
    };

    console.log(
      `${LOG_PREFIX} New connection - ID: ${socket.id}, Name: ${
        deviceName || "Unknown Device"
      }${deviceId ? `, DeviceId: ${deviceId}` : ""}${
        platform ? `, Platform: ${platform}` : ""
      }`
    );

    // Register new user
    addNewUser({
      id: socket.id,
      deviceName: deviceName || "Unknown Device Name",
      deviceId: deviceId,
      platform: platform,
    });

    // --- Event Handlers ---

    // Handle the disconnect event
    socket.on("disconnect", () => handleClose(socket.id));

    // Handle debug messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("message", (msg: any) => {
      handleUserMessage(msg, deviceName || "Unknown");
    });

    // Listening for a message from the dashboard to a specific device
    socket.on(
      "sendToSpecificClient",
      ({
        targetClientId,
        message,
      }: {
        targetClientId: string;
        message: string;
      }) => {
        console.log(
          `${LOG_PREFIX} Dashboard sending to client ${targetClientId}: ${message}`
        );
        io.to(targetClientId).emit("message", message);
      }
    );

    // Listen for query-sync messages from devices and forward only to dashboard clients
    socket.on("query-sync", (message: SyncMessage) => {
      console.log(
        `${LOG_PREFIX} Query sync received from: ${message.deviceName}, Queries: ${message.state.queries.length}, Mutations: ${message.state.mutations.length}`
      );
      // Only forward to dashboard clients, not back to devices
      forwardQuerySyncToDashboards(message);
    });

    // Handle query action messages from the dashboard to the devices
    socket.on("query-action", (message: QueryActionMessage) => {
      // Check if message exists before accessing properties
      if (!message) {
        console.error(`${LOG_PREFIX} Error: query-action message is undefined`);
        return;
      }

      console.log(
        `${LOG_PREFIX} Query action from dashboard - Action: ${message.action}, Target: ${message.targetDevice}`
      );

      withTargetUsers(
        message.targetDevice,
        (user) => io.to(user.id).emit("query-action", message),
        "query action"
      );
    });

    // Handle dashboard requesting initial state from devices
    socket.on(
      "request-initial-state",
      (message: QueryRequestInitialStateMessage) => {
        console.log(
          `${LOG_PREFIX} Request initial state - Target: ${message.targetDevice}`
        );

        // Check if message exists before accessing properties
        if (!message) {
          console.error(
            `${LOG_PREFIX} Error: request-initial-state message is undefined`
          );
          return;
        }

        withTargetUsers(
          message.targetDevice,
          (user) =>
            io
              .to(user.id)
              .emit("request-initial-state", { type: "request-initial-state" }),
          "initial state request"
        );
      }
    );

    // Handle online manager messages from the dashboard to the devices
    socket.on("online-manager", (message: OnlineManagerMessage) => {
      console.log(
        `${LOG_PREFIX} Online manager message from dashboard - Action: ${message.action}, Target: ${message.targetDevice}`
      );

      withTargetUsers(
        message.targetDevice,
        (user) => io.to(user.id).emit("online-manager", message),
        "online manager message"
      );
    });
  });
}
