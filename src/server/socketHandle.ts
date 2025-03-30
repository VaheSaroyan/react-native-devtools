import { Socket, Server as SocketIOServer } from "socket.io";
// Replace the problematic import with a direct type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultEventsMap = Record<string, (...args: any[]) => void>;
import { User } from "../types/User";
import { SyncMessage } from "../components/external-dash/shared/types";
import { QueryActionMessage } from "../components/external-dash/useSyncQueriesWeb";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  io: SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}
let users = [] as User[]; // Connected users
// Keep track of dashboard client IDs
let dashboardClients = [] as string[];

// This is the server side of the socket handle which
// Will forward requests from device to the dashboard
// and vice versa
export default function socketHandle({ io }: Props) {
  function handleClose(id: string) {
    // Remove user from the list
    users = users.filter((user: User) => user.id !== id);
    // Remove from dashboard clients if it exists
    dashboardClients = dashboardClients.filter((clientId) => clientId !== id);
    // Sends new list of users to everyone connected
    io.emit("users-update", users);
  }
  function addNewUser({ id, deviceName }: User) {
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
    if (highestNumber > 0) {
      deviceName = `${deviceName} #${highestNumber + 1}`;
    }
    id &&
      users.push({
        id: id,
        deviceName: deviceName,
      });

    // Check if this is a dashboard client
    if (deviceName === "Dashboard" && id) {
      dashboardClients.push(id);
    }

    io.emit("users-update", users);
  }
  function handleUserMessage(message: string, deviceName: string) {
    io.emit("message", `Device ${deviceName} sent message: ${message}`);
  }

  // Helper function to forward query-sync messages only to dashboard clients
  function forwardQuerySyncToDashboards(message: SyncMessage) {
    dashboardClients.forEach((dashboardId) => {
      io.to(dashboardId).emit("query-sync", message);
    });
  }

  io.on("connection", (socket: Socket) => {
    // Get the query parameters from the handshake
    const { deviceName } = socket.handshake.query as {
      deviceName: string | undefined;
    };

    addNewUser({
      id: socket.id,
      deviceName: deviceName || "Unknown Device Name",
    });
    // Handle the disconnect event
    socket.on("disconnect", () => handleClose(socket.id));
    // Handle the message event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("message", (msg: any) => {
      handleUserMessage(msg, deviceName);
    });
    // Listening for a message from the dashboard to a device
    socket.on(
      "sendToSpecificClient",
      ({
        targetClientId,
        message,
      }: {
        targetClientId: string;
        message: string;
      }) => {
        io.to(targetClientId).emit("message", message);
      }
    );

    // Listen for query-sync messages from devices and forward only to dashboard clients
    socket.on("query-sync", (message: SyncMessage) => {
      console.log("query-sync", message);
      // Only forward to dashboard clients, not back to devices
      forwardQuerySyncToDashboards(message);
    });
    // query changes from the dashboard to the devices
    socket.on("query-action", (message: QueryActionMessage) => {
      console.log("Serverquery-action--", message.action);
      console.log("Target device", message.targetDevice);
      console.log("All devices", users);
      // Find the target device and send only to that device
      const targetUser = users.find(
        (user) => user.deviceName === message.targetDevice
      );
      if (targetUser) {
        console.log("Sending to target device", targetUser.id);
        // Send to the specific target device ID
        io.to(targetUser.id).emit("query-action", message);
      } else if (message.targetDevice === "All") {
        console.log("Broadcasting to all devices");
        // Broadcast to all non-dashboard clients
        users
          .filter((user) => user.deviceName !== "Dashboard")
          .forEach((user) => {
            io.to(user.id).emit("query-action", message);
          });
      } else {
        console.log(`Target device ${message.targetDevice} not found`);
      }
    });
  });
}
