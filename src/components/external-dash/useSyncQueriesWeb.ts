import {
  onlineManager,
  QueryClient,
  QueryKey,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Hydrate } from "./shared/hydration";
import { SyncMessage } from "./shared/types";
import useConnectedUsers from "./_hooks/useConnectedUsers";
import { User } from "./types/User";
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
  // Store selectedDevice in a ref to avoid effect re-runs
  const selectedDeviceRef = useRef(targetDevice);
  // Track previous device ID to avoid duplicate logs
  const prevDeviceIdRef = useRef<string | null>(null);
  const isDeviceSelected =
    !!selectedDeviceRef.current &&
    selectedDeviceRef.current.deviceId !== "No users available";
  // For logging clarity
  const LOG_PREFIX = "[DASHBOARD]";

  // Update ref when selectedDevice changes and handle device switching
  useEffect(() => {
    selectedDeviceRef.current = targetDevice;

    const validDeviceIds = ["All"];
    const invalidDeviceIds = ["No devices available", "Please select a user"];

    const isConnectedAndHasValidDevice =
      isConnected &&
      !!selectedDeviceRef.current &&
      !invalidDeviceIds.includes(selectedDeviceRef.current.deviceId);

    // Check if device ID has changed to avoid duplicate logs
    const deviceIdChanged =
      prevDeviceIdRef.current !== selectedDeviceRef.current.deviceId;
    prevDeviceIdRef.current = selectedDeviceRef.current.deviceId;

    if (isConnectedAndHasValidDevice) {
      // Create message to request initial state from the selected device
      const queryInitialStateMessage: QueryRequestInitialStateMessage = {
        targetDevice: selectedDeviceRef.current,
      };

      console.log(
        `${LOG_PREFIX} Device selection changed to: ${selectedDeviceRef.current.deviceName} (${selectedDeviceRef.current.deviceId})`
      );
      console.log(
        `${LOG_PREFIX} Clearing query cache before requesting new state`
      );

      // Clear all Query cache and mutations when device changes
      queryClient.clear();

      // Request fresh state from devices
      console.log(
        `${LOG_PREFIX} Requesting initial state from: ${selectedDeviceRef.current.deviceName}`
      );

      // Ensure we have a listener before requesting state
      setupQuerySyncListener();

      // Now request the state
      socket.emit("request-initial-state", queryInitialStateMessage);
    } else if (isConnected && selectedDeviceRef.current && deviceIdChanged) {
      // Only log when device ID has changed to reduce console spam
      console.log(
        `${LOG_PREFIX} Not requesting initial state - Invalid device selection: ${selectedDeviceRef.current.deviceName} (${selectedDeviceRef.current.deviceId})`
      );
    }
  }, [targetDevice, socket, queryClient]);

  // Separate function to set up the query-sync listener to ensure consistent behavior
  const setupQuerySyncListener = () => {
    if (!socket) return;

    console.log(`${LOG_PREFIX} Setting up query-sync listener`);

    // Remove any existing listener first
    socket.off("query-sync");

    // Set up the listener
    socket.on("query-sync", (message: SyncMessage) => {
      console.log(
        `${LOG_PREFIX} Received query sync from: ${message.deviceName} (${message.type})`
      );
      if (message.type === "dehydrated-state") {
        // Only process data if it's from the selected device or if "all" is selected
        if (
          selectedDeviceRef.current.deviceId === "All" ||
          message.persistentDeviceId === selectedDeviceRef.current.deviceId
        ) {
          console.log(
            `${LOG_PREFIX} Processing sync from: ${message.deviceName}, Queries: ${message.state.queries.length}, Mutations: ${message.state.mutations.length}`
          );

          // Sync online manager state with device if it has changed
          if (message.isOnlineManagerOnline !== onlineManager.isOnline()) {
            console.log(
              `${LOG_PREFIX} Setting online status to match device: ${
                message.isOnlineManagerOnline ? "ONLINE" : "OFFLINE"
              }`
            );
            onlineManager.setOnline(message.isOnlineManagerOnline);
          }

          // Hydrate the query client with received state
          hydrateState(queryClient, message);
        } else {
          console.log(
            `${LOG_PREFIX} Ignoring sync from: ${message.deviceName} # ${message.persistentDeviceId} - not from selected device ID # (${selectedDeviceRef.current.deviceId})`
          );
        }
      }
    });
  };

  useEffect(() => {
    // Only proceed if we have a valid server connection
    if (!isConnected) {
      console.log(`${LOG_PREFIX} Not connected to server`);
      return;
    }

    console.log(`${LOG_PREFIX} Setting up dashboard sync listeners`);

    // Debug log to verify socket ID and connection status
    console.log(
      `${LOG_PREFIX} Socket ID: ${socket.id}, Connected: ${socket.connected}`
    );

    // Set up the query-sync listener immediately
    setupQuerySyncListener();

    // ==========================================================
    // Subscribe to online dashboard manager changes
    // ==========================================================
    const onlineManagerUnsubscribe = onlineManager.subscribe(
      (isOnline: boolean) => {
        console.log(
          `${LOG_PREFIX} Online status changed: ${
            isOnline ? "ONLINE" : "OFFLINE"
          }`
        );

        const invalidDeviceIds = [
          "No devices available",
          "Please select a user",
        ];

        // Only emit if we have a valid selectedDevice
        if (
          isDeviceSelected &&
          !invalidDeviceIds.includes(selectedDeviceRef.current.deviceId)
        ) {
          // Create message to update online status on the target device
          console.log(
            `${LOG_PREFIX} Sending online status (${
              isOnline ? "ONLINE" : "OFFLINE"
            }) to: ${selectedDeviceRef.current.deviceName}`
          );
          const onlineManagerMessage: OnlineManagerMessage = {
            action: isOnline
              ? "ACTION-ONLINE-MANAGER-ONLINE"
              : "ACTION-ONLINE-MANAGER-OFFLINE",
            targetDevice: selectedDeviceRef.current,
          };
          socket.emit("online-manager", onlineManagerMessage);
          console.log(
            `${LOG_PREFIX} Online status message sent to: ${selectedDeviceRef.current.deviceName}`
          );
        } else {
          console.log(
            `${LOG_PREFIX} Not sending online status - Invalid device selection or no device selected`
          );
        }
      }
    );

    // ==========================================================
    // Subscribe to query actions from the dashboard to the devices
    // ==========================================================
    const querySubscription = queryClient.getQueryCache().subscribe((event) => {
      const invalidDeviceIds = ["No devices available", "Please select a user"];

      // Only proceed if we have a valid selectedDevice
      if (
        !isDeviceSelected ||
        invalidDeviceIds.includes(selectedDeviceRef.current.deviceId)
      ) {
        return;
      }

      // Process query cache events and forward relevant actions to devices
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
            case "ACTION-RESTORE-LOADING": {
              console.log(
                `${LOG_PREFIX} Forwarding query action: ${event.action.type} for query hash: ${event.query.queryHash} to device: ${selectedDeviceRef.current.deviceName}`
              );

              // Create action message to send to the target device
              const queryActionMessage: QueryActionMessage = {
                action: event.action.type as QueryActions,
                device: selectedDeviceRef.current,
                queryHash: event.query.queryHash,
                queryKey: event.query.queryKey,
                data: event.query.state.data,
              };

              // Send the action to the server for routing to the target device
              socket.emit("query-action", queryActionMessage);
              break;
            }
            case "success": {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error This does exist
              if (event.action.manual) {
                console.log(
                  `${LOG_PREFIX} Manual data update detected for query hash: ${event.query.queryHash} to device: ${selectedDeviceRef.current.deviceName}`
                );

                // Create action message to update data on the target device
                const queryActionMessage: QueryActionMessage = {
                  action: "ACTION-DATA-UPDATE",
                  device: selectedDeviceRef.current,
                  queryHash: event.query.queryHash,
                  queryKey: event.query.queryKey,
                  data: event.query.state.data,
                };

                // Send the data update to the server for routing to the target device
                socket.emit("query-action", queryActionMessage);
              }
              break;
            }
          }
      }
    });

    // Cleanup all subscriptions
    return () => {
      console.log(`${LOG_PREFIX} Cleaning up event listeners`);
      socket.off("query-sync");
      onlineManagerUnsubscribe();
      querySubscription();
    };
  }, [queryClient, socket]);

  return { isConnected: !!socket };
}

/**
 * Hydrates the query client with state received from a device
 * Ensures queries remain stale to prevent automatic refetching
 */
function hydrateState(queryClient: QueryClient, message: SyncMessage) {
  console.log(
    `[DASHBOARD] Hydrating QueryClient with state from: ${message.deviceName}`
  );

  Hydrate(queryClient, message.state, {
    defaultOptions: {
      queries: {
        staleTime: Infinity, // Prevent automatic refetching
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
  });
}
