import { CLIENT_URL } from "../config";
import useConnectedUsers from "./external-dash/_hooks/useConnectedUsers";
import { Dash } from "./external-dash/Dash";
import Providers from "./external-dash/providers";

export const App: React.FC = () => {
  const { allDevices, isDashboardConnected, socket } = useConnectedUsers({
    query: {
      deviceName: "Dashboard",
    },
    socketURL: CLIENT_URL,
  });

  return (
    <Providers>
      <Dash
        allDevices={allDevices}
        isDashboardConnected={isDashboardConnected}
        socket={socket}
      />
    </Providers>
  );
};
