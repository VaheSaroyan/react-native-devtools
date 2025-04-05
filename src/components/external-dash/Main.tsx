import { useState } from "react";
import useConnectedUsers from "./_hooks/useConnectedUsers";
import { useSyncQueriesWeb } from "./useSyncQueriesWeb";
import { Dash } from "./Dash";
import { User } from "./types/User";

export default function Main() {
  const [targetDevice, setTargetDevice] = useState<User>({
    deviceId: "Please select a user",
    deviceName: "Please select a user",
    isConnected: false,
    id: "Please select a user",
  });
  useSyncQueriesWeb({ targetDevice });
  const { allDevices, isDashboardConnected } = useConnectedUsers({
    query: {
      deviceName: "Dashboard",
    },
    socketURL: "http://localhost:42831",
  });

  return (
    <Dash
      allDevices={allDevices}
      isDashboardConnected={isDashboardConnected}
      targetDevice={targetDevice}
      setTargetDevice={setTargetDevice}
    />
  );
}
