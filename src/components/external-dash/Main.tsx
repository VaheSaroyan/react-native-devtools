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
  const { allDevices, isDashboardConnected } = useConnectedUsers();
  useSyncQueriesWeb({ targetDevice, allDevices });

  return (
    <Dash
      allDevices={allDevices}
      isDashboardConnected={isDashboardConnected}
      targetDevice={targetDevice}
      setTargetDevice={setTargetDevice}
    />
  );
}
