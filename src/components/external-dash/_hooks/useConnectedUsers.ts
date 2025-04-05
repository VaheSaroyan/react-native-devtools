import io, { Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { User } from "../types/User";
import { ClientQuery } from "../types/ClientQuery";
interface Props {
  query: ClientQuery;
  socketURL: string;
}
let socket = null as Socket | null; // Module-level variable to store the socket instance
export default function useConnectedUsers({ query, socketURL }: Props) {
  const [isDashboardConnected, setIsDashboardConnected] = useState(
    !!socket?.connected
  );
  const [allDevices, setAllDevices] = useState<User[]>([]);

  // Ensure we're properly identifying as a dashboard client with correct query params
  if (!socket) {
    // Include the "Dashboard" identifier explicitly in query params
    const enhancedQuery = {
      ...query,
      deviceName: "Dashboard",
    };

    console.log("[DASHBOARD] Initializing socket with query:", enhancedQuery);

    // Initialize the socket only if it hasn't been already initialized
    socket = io(socketURL, {
      autoConnect: false, // Initially prevent automatic connection
      query: enhancedQuery,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }

  function connect() {
    if (!socket.connected) {
      console.log("[DASHBOARD] Connecting socket...");
      socket?.connect();
    } else {
      console.log("[DASHBOARD] Socket already connected:", socket.id);
    }
  }

  function disconnect() {
    console.log("[DASHBOARD] Disconnecting socket...");
    socket?.disconnect();
  }

  useEffect(() => {
    function onConnect() {
      console.log("[DASHBOARD] Socket connected with ID:", socket?.id);
      setIsDashboardConnected(true);
    }

    function onDisconnect() {
      console.log("[DASHBOARD] Socket disconnected");
      setIsDashboardConnected(false);
    }

    function onConnectError(error: Error) {
      console.error("[DASHBOARD] Connection error:", error.message);
    }

    // Make sure we're connected
    !socket.connected && connect();

    // Listen for all devices updates (including offline devices)
    socket.on("all-devices-update", (devices: User[]) => {
      console.log(
        "[DASHBOARD] Received all-devices-update:",
        devices.length,
        "devices"
      );
      setAllDevices(devices);
    });

    // Add listeners for connection events
    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("connect_error", onConnectError);

    // If already connected, log the ID
    if (socket.connected) {
      console.log(
        "[DASHBOARD] Socket already connected on mount with ID:",
        socket.id
      );
    }

    return () => {
      socket.off("all-devices-update");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      // Don't disconnect on cleanup - this would break the persistent connection
    };
  }, []);

  return {
    socket,
    connect,
    disconnect,
    isDashboardConnected,
    allDevices,
  };
}
