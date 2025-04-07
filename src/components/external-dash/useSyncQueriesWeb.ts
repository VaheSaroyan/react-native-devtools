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
import { logger, createDeviceLogger } from "./utils/logger";

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
  deviceId: string; // Device ID to target
}

/**
 * Message structure for requesting initial state from devices
 */
export interface QueryRequestInitialStateMessage {
  targetDeviceId: string; // Device ID to request state from ('All' || device)
}

/**
 * Message structure for online manager actions sent from dashboard to devices
 */
export interface OnlineManagerMessage {
  action: "ACTION-ONLINE-MANAGER-ONLINE" | "ACTION-ONLINE-MANAGER-OFFLINE";
  targetDeviceId: string; // Device ID to target ('All' || device)
}

// --- Constants ---
const LOG_PREFIX = "[DASHBOARD]";
const INVALID_DEVICE_IDS = ["No devices available", "Please select a device"];

// Logger metadata types
interface BaseLogMetadata extends Partial<User> {
  queriesCount?: number;
  mutationsCount?: number;
  status?: "ONLINE" | "OFFLINE";
  connectionStatus?: "CONNECTED" | "DISCONNECTED";
  socketExists?: boolean;
  action?: QueryActions;
  queryHash?: string;
  queryKey?: QueryKey;
  validationError?: string;
  previousDevice?: {
    deviceName: string;
    deviceId: string;
  };
  newDevice?: {
    deviceName: string;
    deviceId: string;
    platform?: string;
  };
  // Additional fields for better debugging
  currentSelectedDeviceId?: string;
  currentSelectedDeviceName?: string;
  eventType?: string;
}

// --- Helper Functions ---

/** Checks if the provided device is valid for communication. */
const isValidDevice = (device: User | null): boolean => {
  return !!device && !INVALID_DEVICE_IDS.includes(device.deviceId);
};

/** Hydrates the query client with state received from a device */
const hydrateState = (
  queryClient: QueryClient,
  message: SyncMessage,
  deviceName: string
) => {
  const metadata: BaseLogMetadata = {
    deviceName,
    deviceId: message.persistentDeviceId,
    queriesCount: message.state.queries.length,
    mutationsCount: message.state.mutations.length,
  };
  logger.info(
    `${LOG_PREFIX} Hydrating state from device ${deviceName} `,
    metadata
  );

  Hydrate(queryClient, message.state, {
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
  });
};

/** Sends a request for initial state to the target device. */
const requestInitialState = (socket: Socket, targetDevice: User) => {
  const deviceLogger = createDeviceLogger(targetDevice);
  deviceLogger.info(
    `${LOG_PREFIX} Requesting initial state from device: ${targetDevice.deviceName} (${targetDevice.deviceId})`
  );

  const message: QueryRequestInitialStateMessage = {
    targetDeviceId: targetDevice.deviceId,
  };
  socket.emit("request-initial-state", message);
};

/** Sends a query action message to the target device. */
const sendQueryAction = (
  socket: Socket,
  targetDevice: User,
  action: QueryActions,
  query: { queryHash: string; queryKey: QueryKey; state: { data: unknown } }
) => {
  const deviceLogger = createDeviceLogger(targetDevice);
  // Note: Since deviceLogger already has device context, we don't pass metadata as second param
  deviceLogger.info(
    `${LOG_PREFIX} Forwarding query action '${action}' to device: ${targetDevice.deviceName}`
  );

  const message: QueryActionMessage = {
    action,
    deviceId: targetDevice.deviceId,
    queryHash: query.queryHash,
    queryKey: query.queryKey,
    data: query.state.data,
  };
  socket.emit("query-action", message);
};

/** Sends an online status update message to the target device. */
const sendOnlineStatus = (
  socket: Socket,
  targetDevice: User,
  isOnline: boolean
) => {
  const deviceLogger = createDeviceLogger(targetDevice);
  const statusText = isOnline ? "ONLINE" : "OFFLINE";

  deviceLogger.info(
    `${LOG_PREFIX} Sending ${statusText} status update to device: ${targetDevice.deviceName}`
  );

  const message: OnlineManagerMessage = {
    action: isOnline
      ? "ACTION-ONLINE-MANAGER-ONLINE"
      : "ACTION-ONLINE-MANAGER-OFFLINE",
    targetDeviceId: targetDevice.deviceId,
  };
  socket.emit("online-manager", message);

  deviceLogger.debug(
    `${LOG_PREFIX} Online status message sent successfully to ${targetDevice.deviceName}`
  );
};

interface Props {
  targetDevice: User; // Currently selected device persistent ID
  allDevices: User[];
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
export function useSyncQueriesWeb({ targetDevice, allDevices }: Props) {
  const { socket } = useConnectedUsers();
  const isConnected = !!socket && socket.connected;

  const queryClient = useQueryClient();
  const selectedDeviceRef = useRef(targetDevice);

  // --- Callbacks ---

  // Callback to handle incoming query sync messages
  const handleQuerySync = useCallback(
    (message: SyncMessage) => {
      // Function that returns device from all devices based off deviceId
      function getDeviceFromDeviceId(deviceId: string) {
        return allDevices.find((device) => device.deviceId === deviceId);
      }

      const device = getDeviceFromDeviceId(message.persistentDeviceId);
      const deviceName = device?.deviceName || "Unknown Device";

      const metadata: BaseLogMetadata = {
        deviceName,
        deviceId: message.persistentDeviceId,
        platform: device?.platform,
        queriesCount: message.state.queries.length,
        mutationsCount: message.state.mutations.length,
      };
      logger.info(
        `${LOG_PREFIX} Received query sync from device: ${deviceName} `,
        metadata
      );

      if (message.type !== "dehydrated-state") {
        logger.warn(
          `${LOG_PREFIX} Received unexpected message type: ${message.type} from ${deviceName}`,
          metadata
        );
        return;
      }

      const currentSelectedDevice = selectedDeviceRef.current;
      const isFromSelectedDevice =
        currentSelectedDevice.deviceId === "All" ||
        message.persistentDeviceId === currentSelectedDevice.deviceId;

      if (isFromSelectedDevice) {
        if (message.isOnlineManagerOnline !== onlineManager.isOnline()) {
          const onlineMetadata: BaseLogMetadata = {
            status: message.isOnlineManagerOnline ? "ONLINE" : "OFFLINE",
            deviceName,
            deviceId: message.persistentDeviceId,
            platform: device?.platform,
          };
          const statusText = message.isOnlineManagerOnline
            ? "ONLINE"
            : "OFFLINE";
          logger.info(
            `${LOG_PREFIX} Syncing online status with device ${deviceName}: Setting dashboard to ${statusText}`,
            onlineMetadata
          );
          onlineManager.setOnline(message.isOnlineManagerOnline);
        }

        hydrateState(queryClient, message, deviceName);
      } else {
        const metadata: BaseLogMetadata = {
          deviceId: message.persistentDeviceId,
          deviceName,
          platform: device?.platform,
          currentSelectedDeviceId: currentSelectedDevice.deviceId,
          currentSelectedDeviceName: currentSelectedDevice.deviceName,
        };
        logger.debug(
          `${LOG_PREFIX} Ignoring sync from non-selected device: ${deviceName} (selected is ${currentSelectedDevice.deviceName})`,
          metadata
        );
      }
    },
    [queryClient, allDevices]
  );

  // --- Effects ---

  // Effect to handle device selection changes
  useEffect(() => {
    const previousDevice = selectedDeviceRef.current;
    selectedDeviceRef.current = targetDevice; // Update the ref immediately

    if (!isConnected || !socket) {
      const metadata: BaseLogMetadata = {
        status: isConnected ? "ONLINE" : "OFFLINE",
        deviceName: targetDevice.deviceName,
        deviceId: targetDevice.deviceId,
        platform: targetDevice.platform,
        connectionStatus: isConnected ? "CONNECTED" : "DISCONNECTED",
        socketExists: !!socket,
      };
      logger.warn(
        `${LOG_PREFIX} Device selection changed to ${targetDevice.deviceName} but connection unavailable`,
        metadata
      );
      return;
    }

    // Only log/clear/request if the device ID actually changed
    if (previousDevice.deviceId === targetDevice.deviceId) {
      return;
    }

    const metadata: BaseLogMetadata = {
      previousDevice: {
        deviceName: previousDevice.deviceName,
        deviceId: previousDevice.deviceId,
      },
      newDevice: {
        deviceName: targetDevice.deviceName,
        deviceId: targetDevice.deviceId,
        platform: targetDevice.platform,
      },
    };
    logger.info(
      `${LOG_PREFIX} Device selection changed from '${previousDevice.deviceName}' to '${targetDevice.deviceName}'`,
      metadata
    );

    if (isValidDevice(targetDevice)) {
      const stateMetadata: BaseLogMetadata = {
        deviceName: targetDevice.deviceName,
        deviceId: targetDevice.deviceId,
        platform: targetDevice.platform,
      };
      logger.info(
        `${LOG_PREFIX} Clearing dashboard query cache and requesting fresh state from '${targetDevice.deviceName}'`,
        stateMetadata
      );
      queryClient.clear();
      requestInitialState(socket, targetDevice);
    } else {
      const errorMetadata: BaseLogMetadata = {
        deviceName: targetDevice.deviceName,
        deviceId: targetDevice.deviceId,
        platform: targetDevice.platform,
        validationError: "Invalid device ID",
      };
      logger.warn(
        `${LOG_PREFIX} Invalid device selection '${targetDevice.deviceName}' - skipping state request`,
        errorMetadata
      );
    }
  }, [targetDevice, isConnected, socket, queryClient]);

  // Effect to set up the main query-sync listener
  useEffect(() => {
    if (!isConnected || !socket) {
      const metadata: BaseLogMetadata = {
        status: "OFFLINE",
        connectionStatus: isConnected ? "CONNECTED" : "DISCONNECTED",
        socketExists: !!socket,
      };
      logger.warn(
        `${LOG_PREFIX} Cannot setup query-sync listeners - no socket connection available`,
        metadata
      );
      return;
    }

    logger.info(
      `${LOG_PREFIX} Setting up query-sync event listener for incoming device updates`
    );
    socket.on("query-sync", handleQuerySync);

    return () => {
      logger.info(`${LOG_PREFIX} Cleaning up query-sync event listener`);
      socket.off("query-sync", handleQuerySync);
    };
  }, [isConnected, socket, handleQuerySync]);

  // Effect to handle online manager status synchronization
  useEffect(() => {
    if (!isConnected || !socket) return;

    const onlineManagerUnsubscribe = onlineManager.subscribe(
      (isOnline: boolean) => {
        const currentSelectedDevice = selectedDeviceRef.current;
        const statusText = isOnline ? "ONLINE" : "OFFLINE";
        const metadata: BaseLogMetadata = {
          status: statusText,
          deviceName: currentSelectedDevice?.deviceName,
          deviceId: currentSelectedDevice?.deviceId,
        };
        logger.info(
          `${LOG_PREFIX} Dashboard online status changed to ${statusText} - syncing with device`,
          metadata
        );

        if (isValidDevice(currentSelectedDevice)) {
          sendOnlineStatus(socket, currentSelectedDevice, isOnline);
        } else {
          const errorMetadata: BaseLogMetadata = {
            status: statusText,
            deviceId: currentSelectedDevice?.deviceId,
            deviceName: currentSelectedDevice?.deviceName,
            validationError: "No valid device selected",
          };
          logger.warn(
            `${LOG_PREFIX} Cannot sync ${statusText} status - no valid device selected`,
            errorMetadata
          );
        }
      }
    );

    return () => {
      logger.info(`${LOG_PREFIX} Cleaning up online manager subscription`);
      onlineManagerUnsubscribe();
    };
  }, [isConnected, socket]); // Depends on connection status and socket instance

  // Effect to handle query cache changes and forward actions
  useEffect(() => {
    if (!isConnected || !socket) return;

    const queryCache = queryClient.getQueryCache();
    logger.info(
      `${LOG_PREFIX} Setting up query cache listener to forward actions to device`
    );

    const querySubscription = queryCache.subscribe((event) => {
      const currentSelectedDevice = selectedDeviceRef.current;

      if (!isValidDevice(currentSelectedDevice)) {
        const logMetadata: BaseLogMetadata = {
          eventType: event.type,
          deviceId: currentSelectedDevice?.deviceId,
          deviceName: currentSelectedDevice?.deviceName,
        };
        logger.debug(
          `${LOG_PREFIX} Query cache event ignored - no valid device selected`,
          logMetadata
        );
        return; // Don't forward actions if no valid device is selected
      }

      // Process query cache events
      if (event.type === "updated") {
        const actionType = event.action.type as QueryActions;
        const queryLogMetadata: BaseLogMetadata = {
          queryHash: event.query.queryHash,
          queryKey: event.query.queryKey,
          deviceName: currentSelectedDevice.deviceName,
          deviceId: currentSelectedDevice.deviceId,
          action: actionType,
        };

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
            logger.debug(
              `${LOG_PREFIX} Forwarding ${actionType} to device: ${currentSelectedDevice.deviceName}`,
              queryLogMetadata
            );
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
              logger.debug(
                `${LOG_PREFIX} Forwarding manual data update to device: ${currentSelectedDevice.deviceName}`,
                queryLogMetadata
              );
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
      logger.info(`${LOG_PREFIX} Cleaning up query cache subscription`);
      querySubscription();
    };
  }, [isConnected, socket, queryClient]); // Depends on connection, socket, and queryClient

  // Return connection status (or potentially other state if needed later)
  return { isConnected };
}
