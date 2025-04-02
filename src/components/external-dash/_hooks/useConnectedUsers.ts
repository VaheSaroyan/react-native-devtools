import io, { Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { User } from "../types/User";
import { ClientQuery } from "../types/ClientQuery";
interface Props {
  query: ClientQuery;
  socketURL: string;
  showOfflineDevices: boolean;
}
let socket = null as Socket | null; // Module-level variable to store the socket instance
export default function useConnectedUsers({
  query,
  socketURL,
  showOfflineDevices,
}: Props) {
  const [isDashboardConnected, setIsDashboardConnected] = useState(
    !!socket?.connected
  );
  const [allDevices, setAllDevices] = useState<User[]>([]);

  if (!socket) {
    // Initialize the socket only if it hasn't been already initialized
    socket = io(socketURL, {
      autoConnect: false, // Initially prevent automatic connection
      query,
    });
  }

  function connect() {
    socket?.connect();
  }
  function disconnect() {
    socket?.disconnect();
  }
  useEffect(() => {
    function onConnect() {
      setIsDashboardConnected(true);
    }
    function onDisconnect() {
      setIsDashboardConnected(false);
    }
    !socket.connected && connect();

    // Listen for all devices updates (including offline devices)
    socket.on("all-devices-update", (devices: User[]) => {
      setAllDevices(devices);
    });

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);

    return () => {
      socket.off("all-devices-update");
      socket.off("connect");
      socket.off("disconnect");
      onDisconnect();
      disconnect();
    };
  }, []);

  const filteredDevices = showOfflineDevices
    ? allDevices
    : allDevices.filter((device) => device.isConnected);
  return {
    socket,
    connect,
    disconnect,
    isDashboardConnected,
    allDevices: filteredDevices,
  };
}
