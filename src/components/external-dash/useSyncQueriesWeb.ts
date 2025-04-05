import {
  onlineManager,
  QueryClient,
  QueryKey,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { Hydrate } from "./shared/hydration";
import { SyncMessage } from "./shared/types";
import useConnectedUsers from "./_hooks/useConnectedUsers";
import { User } from "./types/User";
import { Socket } from "socket.io-client";

/**
 * Query actions that can be performed on a query.
 * These actions are used to control query state on remote devices.
 */
type QueryActions =
  // Regular query actions
  | "ACTION-REFETCH" // Refetch a query without invalidating it
  | "ACTION-INVALIDATE" // Invalidate a query and trigger a refetch
  | "ACTION-RESET" // Reset a query to its initial state
  | "ACTION-REMOVE" // Remove a query from the cache
  | "ACTION-DATA-UPDATE" // Update a query's data manually
  // Error handling actions
  | "ACTION-TRIGGER-ERROR" // Manually trigger an error state
  | "ACTION-RESTORE-ERROR" // Restore from an error state
  // Loading state actions
  | "ACTION-TRIGGER-LOADING" // Manually trigger a loading state
  | "ACTION-RESTORE-LOADING" // Restore from a loading state
  | "success"; // Internal success action

/**
 * Message structure for query actions sent from dashboard to devices
 */
export interface QueryActionMessage {
  queryHash: string; // Unique hash of the query
  queryKey: QueryKey; // Key array used to identify the query
  data: unknown; // Data payload (if applicable)
  action: QueryActions; // Action to perform
  device: User; // Device to target
}

/**
 * Message structure for requesting initial state from devices
 */
export interface QueryRequestInitialStateMessage {
  targetDevice: User; // Device ID to request state from ('All' || device)
}

/**
 * Message structure for online manager actions sent from dashboard to devices
 */
export interface OnlineManagerMessage {
  action: "ACTION-ONLINE-MANAGER-ONLINE" | "ACTION-ONLINE-MANAGER-OFFLINE";
  targetDevice: User; // Device ID to target ('All' || device)
}

interface Props {
  targetDevice: User; // Currently selected device persistent ID
}

// --- Constants ---
const LOG_PREFIX = "[DASHBOARD]";
const INVALID_DEVICE_IDS = ["No devices available", "Please select a user"];

// --- Helper Functions ---

/** Checks if the provided device is valid for communication. */
const isValidDevice = (device: User | null): boolean => {
  return !!device && !INVALID_DEVICE_IDS.includes(device.deviceId);
};

/** Hydrates the query client with state received from a device */
const hydrateState = (queryClient: QueryClient, message: SyncMessage) => {
  console.log(
    `${LOG_PREFIX} Hydrating QueryClient with state from: ${message.deviceName}`
  );
  Hydrate(queryClient, message.state, {
    defaultOptions: {
      queries: {
        staleTime: Infinity, // Prevent automatic refetching
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
  });
};

/** Sends a request for initial state to the target device. */
const requestInitialState = (socket: Socket, targetDevice: User) => {
  console.log(
    `${LOG_PREFIX} Requesting initial state from: ${targetDevice.deviceName}`
  );
  const message: QueryRequestInitialStateMessage = { targetDevice };
  socket.emit("request-initial-state", message);
};

/** Sends a query action message to the target device. */
const sendQueryAction = (
  socket: Socket,
  targetDevice: User,
  action: QueryActions,
  query: { queryHash: string; queryKey: QueryKey; state: { data: unknown } }
) => {
  console.log(
    `${LOG_PREFIX} Forwarding query action: ${action} for query hash: ${query.queryHash} to device: ${targetDevice.deviceName}`
  );
  const message: QueryActionMessage = {
    action,
    device: targetDevice,
    queryHash: query.queryHash,
    queryKey: query.queryKey,
    data: query.state.data, // Send current data state
  };
  socket.emit("query-action", message);
};

/** Sends an online status update message to the target device. */
const sendOnlineStatus = (
  socket: Socket,
  targetDevice: User,
  isOnline: boolean
) => {
  console.log(
    `${LOG_PREFIX} Sending online status (${
      isOnline ? "ONLINE" : "OFFLINE"
    }) to: ${targetDevice.deviceName}`
  );
  const message: OnlineManagerMessage = {
    action: isOnline
      ? "ACTION-ONLINE-MANAGER-ONLINE"
      : "ACTION-ONLINE-MANAGER-OFFLINE",
    targetDevice,
  };
  socket.emit("online-manager", message);
  console.log(
    `${LOG_PREFIX} Online status message sent to: ${targetDevice.deviceName}`
  );
};

/**
 * Hook used by the dashboard to sync with and control device queries
 *
 * Handles:
 * - Requesting initial query state from devices
 * - Forwarding query actions to devices
 * - Processing query state updates from devices
 * - Tracking connected devices
 */
export function useSyncQueriesWeb({ targetDevice }: Props) {
  const { socket } = useConnectedUsers({
    query: {
      deviceName: "Dashboard",
    },
    socketURL: "http://localhost:42831",
  });
  const isConnected = !!socket && socket.connected;

  const queryClient = useQueryClient();
  const selectedDeviceRef = useRef(targetDevice);

  // --- Callbacks ---

  // Callback to handle incoming query sync messages
  const handleQuerySync = useCallback(
    (message: SyncMessage) => {
      console.log(
        `${LOG_PREFIX} Received query sync from: ${message.deviceName} (${message.type})`
      );

      if (message.type !== "dehydrated-state") return;

      const currentSelectedDevice = selectedDeviceRef.current;
      const isFromSelectedDevice =
        currentSelectedDevice.deviceId === "All" ||
        message.persistentDeviceId === currentSelectedDevice.deviceId;

      if (isFromSelectedDevice) {
        console.log(
          `${LOG_PREFIX} Processing sync from: ${message.deviceName}, Queries: ${message.state.queries.length}, Mutations: ${message.state.mutations.length}`
        );

        // Sync online manager state if needed
        if (message.isOnlineManagerOnline !== onlineManager.isOnline()) {
          console.log(
            `${LOG_PREFIX} Setting online status to match device: ${
              message.isOnlineManagerOnline ? "ONLINE" : "OFFLINE"
            }`
          );
          onlineManager.setOnline(message.isOnlineManagerOnline);
        }

        hydrateState(queryClient, message);
      } else {
        console.log(
          `${LOG_PREFIX} Ignoring sync from: ${message.deviceName} # ${message.persistentDeviceId} - not selected device ID # (${currentSelectedDevice.deviceId})`
        );
      }
    },
    [queryClient] // Dependency on queryClient for hydrateState
  );

  // --- Effects ---

  // Effect to handle device selection changes
  useEffect(() => {
    const previousDevice = selectedDeviceRef.current;
    selectedDeviceRef.current = targetDevice; // Update the ref immediately

    if (!isConnected || !socket) {
      console.log(
        `${LOG_PREFIX} Device selection changed, but not connected to server.`
      );
      return;
    }

    // Only log/clear/request if the device ID actually changed
    if (previousDevice.deviceId === targetDevice.deviceId) {
      return;
    }

    console.log(
      `${LOG_PREFIX} Device selection changed to: ${targetDevice.deviceName} (${targetDevice.deviceId})`
    );

    if (isValidDevice(targetDevice)) {
      console.log(
        `${LOG_PREFIX} Clearing query cache before requesting new state`
      );
      queryClient.clear(); // Clear cache for the new device
      requestInitialState(socket, targetDevice);
    } else {
      console.log(
        `${LOG_PREFIX} Not requesting initial state - Invalid device selection: ${targetDevice.deviceName} (${targetDevice.deviceId})`
      );
      // Optionally clear cache even for invalid selection if desired
      // queryClient.clear();
    }
  }, [targetDevice, isConnected, socket, queryClient]);

  // Effect to set up the main query-sync listener
  useEffect(() => {
    if (!isConnected || !socket) {
      console.log(`${LOG_PREFIX} Cannot set up listeners: Not connected.`);
      return;
    }

    console.log(`${LOG_PREFIX} Setting up query-sync listener`);
    socket.on("query-sync", handleQuerySync);

    return () => {
      console.log(`${LOG_PREFIX} Cleaning up query-sync listener`);
      socket.off("query-sync", handleQuerySync);
    };
  }, [isConnected, socket, handleQuerySync]);

  // Effect to handle online manager status synchronization
  useEffect(() => {
    if (!isConnected || !socket) return;

    const onlineManagerUnsubscribe = onlineManager.subscribe(
      (isOnline: boolean) => {
        const currentSelectedDevice = selectedDeviceRef.current;
        console.log(
          `${LOG_PREFIX} Online status changed: ${
            isOnline ? "ONLINE" : "OFFLINE"
          }`
        );

        if (isValidDevice(currentSelectedDevice)) {
          sendOnlineStatus(socket, currentSelectedDevice, isOnline);
        } else {
          console.log(
            `${LOG_PREFIX} Not sending online status - Invalid or no device selected`
          );
        }
      }
    );

    return () => {
      console.log(`${LOG_PREFIX} Cleaning up online manager listener`);
      onlineManagerUnsubscribe();
    };
  }, [isConnected, socket]); // Depends on connection status and socket instance

  // Effect to handle query cache changes and forward actions
  useEffect(() => {
    if (!isConnected || !socket) return;

    const queryCache = queryClient.getQueryCache();
    const querySubscription = queryCache.subscribe((event) => {
      const currentSelectedDevice = selectedDeviceRef.current;

      if (!isValidDevice(currentSelectedDevice)) {
        return; // Don't forward actions if no valid device is selected
      }

      // Process query cache events
      if (event.type === "updated") {
        const actionType = event.action.type as QueryActions;
        switch (actionType) {
          // Actions to forward directly
          case "ACTION-REFETCH":
          case "ACTION-INVALIDATE":
          case "ACTION-TRIGGER-ERROR":
          case "ACTION-RESTORE-ERROR":
          case "ACTION-RESET":
          case "ACTION-REMOVE":
          case "ACTION-TRIGGER-LOADING":
          case "ACTION-RESTORE-LOADING":
            sendQueryAction(
              socket,
              currentSelectedDevice,
              actionType,
              event.query
            );
            break;

          // Handle manual data updates specifically
          case "success": {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error This 'manual' property might exist based on usage pattern
            if (event.action.manual) {
              sendQueryAction(
                socket,
                currentSelectedDevice,
                "ACTION-DATA-UPDATE",
                event.query
              );
            }
            break;
          }
        }
      }
    });

    return () => {
      console.log(`${LOG_PREFIX} Cleaning up query cache listener`);
      querySubscription();
    };
  }, [isConnected, socket, queryClient]); // Depends on connection, socket, and queryClient

  // Return connection status (or potentially other state if needed later)
  return { isConnected };
}
