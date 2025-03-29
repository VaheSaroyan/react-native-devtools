import { onlineManager, QueryClient, QueryKey } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Hydrate } from "./shared/hydration";
import { SyncMessage } from "./shared/types";
import { User } from "../../types/User";

type QueryActions =
  | "ACTION-REFETCH"
  | "ACTION-INVALIDATE"
  | "ACTION-TRIGGER-ERROR"
  | "ACTION-RESTORE-ERROR"
  | "ACTION-RESET"
  | "ACTION-REMOVE"
  | "ACTION-TRIGGER-LOADING"
  | "ACTION-RESTORE-LOADING"
  | "ACTION-DATA-UPDATE"
  | "success";

interface QueryActionMessage {
  queryHash: string;
  queryKey: QueryKey;
  data: unknown;
  action: QueryActions;
  targetDevice: string;
}

interface Props {
  queryClient: QueryClient;
  setDevices: React.Dispatch<React.SetStateAction<User[]>>;
  selectedDevice: string;
  socket: Socket;
}

export function useSyncQueriesWeb({
  queryClient,
  setDevices,
  selectedDevice,
  socket,
}: Props) {
  // Store selectedDevice in a ref to avoid effect re-runs
  const selectedDeviceRef = useRef(selectedDevice);

  // Update ref when selectedDevice changes and handle device switching
  useEffect(() => {
    selectedDeviceRef.current = selectedDevice;

    if (socket) {
      // Clear all Query cache and mutations when device changes
      queryClient.clear();
      // Request fresh state from devices
      socket.send("request-initial-state", {
        type: "initial-state-request",
      });
    }
  }, [selectedDevice, socket, queryClient]);

  useEffect(() => {
    if (!socket) {
      console.log("No socket");
      return;
    }
    console.log("Connected");
    // Subscribe to online manager changes
    onlineManager.subscribe((isOnline: boolean) => {
      socket.send("online-manager", {
        action: isOnline
          ? "ACTION-ONLINE-MANAGER-ONLINE"
          : "ACTION-ONLINE-MANAGER-OFFLINE",
        targetDevice: selectedDeviceRef.current,
      });
    });
    // Subscribe to query changes
    const querySubscription = queryClient.getQueryCache().subscribe((event) => {
      switch (event.type) {
        case "updated":
          switch (event.action.type as QueryActions) {
            case "ACTION-REFETCH":
            case "ACTION-INVALIDATE":
            case "ACTION-TRIGGER-ERROR":
            case "ACTION-RESTORE-ERROR":
            case "ACTION-RESET":
            case "ACTION-REMOVE":
            case "ACTION-TRIGGER-LOADING":
            case "ACTION-RESTORE-LOADING":
              socket.send("query-action", {
                queryHash: event.query.queryHash,
                queryKey: event.query.queryKey,
                action: event.action.type as QueryActions,
                targetDevice: selectedDeviceRef.current,
              } as QueryActionMessage);
              break;
            case "success":
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (event.action.manual) {
                socket.send("query-action", {
                  queryHash: event.query.queryHash,
                  queryKey: event.query.queryKey,
                  data: event.query.state.data,
                  action: "ACTION-DATA-UPDATE",
                  targetDevice: selectedDeviceRef.current,
                } as QueryActionMessage);
              }
              break;
          }
      }
    });

    // Subscribe to query sync messages
    socket.on("query-sync", (message: SyncMessage) => {
      if (message.type === "dehydrated-state") {
        // Only process data if it's from the selected device or if "all" is selected
        if (
          selectedDeviceRef.current === "All" ||
          message.Device.id === selectedDeviceRef.current
        ) {
          // Sync online manager state
          onlineManager.setOnline(message.isOnlineManagerOnline);
          hydrateState(queryClient, message);
        }
      }
    });

    // Subscribe to device changes
    socket.on("users-update", (response: { users: User[] }) => {
      console.log("users-update", response);
      setDevices(response.users);
    });

    // Cleanup all subscriptions
    return () => {
      socket.off("query-sync");
      socket.off("users-update");
      querySubscription();
    };
  }, [queryClient, socket]); // Keep dependencies minimal

  return { isConnected: !!socket };
}

// Hydrate sets initial data state
function hydrateState(queryClient: QueryClient, message: SyncMessage) {
  Hydrate(queryClient, message.state, {
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
  });
}
