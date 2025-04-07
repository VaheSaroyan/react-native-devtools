import { useState } from "react";
import useConnectedUsers from "./_hooks/useConnectedUsers";
import { useSyncQueriesWeb } from "./useSyncQueriesWeb";
import { Dash } from "./Dash";
import { User } from "./types/User";

export default function Main() {
  const [targetDevice, setTargetDevice] = useState<User>({
    deviceId: "Please select a device",
    deviceName: "Please select a device",
    isConnected: false,
    id: "Please select a device",
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
