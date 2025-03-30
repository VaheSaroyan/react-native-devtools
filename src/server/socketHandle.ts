import { Socket, Server as SocketIOServer } from "socket.io";
// Replace the problematic import with a direct type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultEventsMap = Record<string, (...args: any[]) => void>;
import { User } from "../types/User";
import { SyncMessage } from "../components/external-dash/shared/types";
import {
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
let dashboardClients = [] as string[]; // Dashboard client IDs

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

    // Remove user from the list
    users = users.filter((user: User) => user.id !== id);

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
    console.log(
      `${LOG_PREFIX} Updated users list: ${users
        .map((u) => u.deviceName)
        .join(", ")}`
    );
  }

  /**
   * Add a new user to the connected users list with unique naming
   */
  function addNewUser({ id, deviceName }: User) {
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
      users.push({
        id: id,
        deviceName: deviceName,
      });
      console.log(
        `${LOG_PREFIX} New user connected - ID: ${id}, Name: ${deviceName}`
      );

      // Check if this is a dashboard client
      if (deviceName === "Dashboard" && id) {
        dashboardClients.push(id);
        console.log(`${LOG_PREFIX} Registered dashboard client with ID: ${id}`);
      }

      // Notify all clients of updated user list
      io.emit("users-update", users);
      console.log(
        `${LOG_PREFIX} Updated users list: ${users
          .map((u) => u.deviceName)
          .join(", ")}`
      );
    }
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

  // Main socket connection handler
  io.on("connection", (socket: Socket) => {
    // Get the query parameters from the handshake
    const { deviceName } = socket.handshake.query as {
      deviceName: string | undefined;
    };

    console.log(
      `${LOG_PREFIX} New connection - ID: ${socket.id}, Name: ${
        deviceName || "Unknown Device"
      }`
    );

    // Register new user
    addNewUser({
      id: socket.id,
      deviceName: deviceName || "Unknown Device Name",
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

      // Find the target device and send only to that device
      const targetUser = users.find(
        (user) => user.deviceName === message.targetDevice
      );

      if (targetUser) {
        console.log(
          `${LOG_PREFIX} Sending to target device ${targetUser.deviceName} (${targetUser.id})`
        );
        // Send to the specific target device ID
        io.to(targetUser.id).emit("query-action", message);
      } else if (message.targetDevice === "All") {
        console.log(`${LOG_PREFIX} Broadcasting query action to all devices`);
        // Broadcast to all non-dashboard clients
        const deviceUsers = users.filter(
          (user) => user.deviceName !== "Dashboard"
        );
        console.log(
          `${LOG_PREFIX} Sending to ${deviceUsers.length} devices: ${deviceUsers
            .map((u) => u.deviceName)
            .join(", ")}`
        );

        deviceUsers.forEach((user) => {
          io.to(user.id).emit("query-action", message);
        });
      } else {
        console.log(
          `${LOG_PREFIX} Target device ${message.targetDevice} not found`
        );
      }
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

        // Find the target device and send request only to that device
        const targetUser = users.find(
          (user) => user.deviceName === message.targetDevice
        );

        if (targetUser) {
          console.log(
            `${LOG_PREFIX} Requesting initial state from device: ${targetUser.deviceName} (${targetUser.id})`
          );
          // Send to the specific target device ID
          io.to(targetUser.id).emit("request-initial-state", {
            type: "request-initial-state",
          });
        } else if (message.targetDevice === "All") {
          console.log(
            `${LOG_PREFIX} Requesting initial state from all devices`
          );
          // Broadcast to all non-dashboard clients
          const deviceUsers = users.filter(
            (user) => user.deviceName !== "Dashboard"
          );
          console.log(
            `${LOG_PREFIX} Sending to ${
              deviceUsers.length
            } devices: ${deviceUsers.map((u) => u.deviceName).join(", ")}`
          );

          deviceUsers.forEach((user) => {
            io.to(user.id).emit("request-initial-state", {
              type: "request-initial-state",
            });
          });
        } else {
          console.log(
            `${LOG_PREFIX} Target device ${message.targetDevice} not found`
          );
        }
      }
    );
  });
}
