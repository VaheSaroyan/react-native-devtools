import { useEffect, useRef } from "react";
import { onDevToolsEvent } from "../utils/devToolsEvents";
import type { DevToolsActionType } from "../utils/devToolsEvents";
import { useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import type { User } from "../types/User";
import type { QueryKey } from "@tanstack/react-query";
import { logger } from "../utils/logger";

interface UseDevToolsEventHandlerProps {
  isConnected?: boolean;
  socket?: Socket;
  selectedDevice?: User;
  sendQueryAction?: (
    socket: Socket,
    targetDevice: User,
    action: string,
    query: {
      queryHash: string;
      queryKey: QueryKey;
      state: { data: unknown };
    }
  ) => void;
}

const actionTypeToQueryAction: Record<DevToolsActionType, string> = {
  REFETCH: "ACTION-REFETCH",
  INVALIDATE: "ACTION-INVALIDATE",
  RESET: "ACTION-RESET",
  REMOVE: "ACTION-REMOVE",
  TRIGGER_ERROR: "ACTION-TRIGGER-ERROR",
  RESTORE_ERROR: "ACTION-RESTORE-ERROR",
  TRIGGER_LOADING: "ACTION-TRIGGER-LOADING",
  RESTORE_LOADING: "ACTION-RESTORE-LOADING",
  CLEAR_MUTATION_CACHE: "ACTION-CLEAR-MUTATION-CACHE",
  CLEAR_QUERY_CACHE: "ACTION-CLEAR-QUERY-CACHE",
};

export const useDevToolsEventHandler = ({
  isConnected,
  socket,
  selectedDevice,
  sendQueryAction,
}: UseDevToolsEventHandlerProps = {}) => {
  const queryClient = useQueryClient();
  const isReadyRef = useRef(false);

  // Track when all dependencies are ready
  useEffect(() => {
    isReadyRef.current = !!(
      isConnected &&
      socket &&
      selectedDevice &&
      sendQueryAction
    );
    logger.debug("🔍 DevToolsEventHandler Ready State:", {
      deviceId: selectedDevice?.deviceId,
      deviceName: selectedDevice?.deviceName,
      platform: selectedDevice?.platform,
    });
  }, [isConnected, socket, selectedDevice, sendQueryAction]);

  useEffect(() => {
    // Only set up the event handler if all dependencies are available
    if (!isReadyRef.current) {
      logger.debug(
        "🔄 Waiting for dependencies to be ready before setting up event handler",
        {
          deviceId: selectedDevice?.deviceId,
          deviceName: selectedDevice?.deviceName,
          platform: selectedDevice?.platform,
        }
      );
      return;
    }

    logger.debug(
      "🔄 Setting up dev tools event handler - all dependencies ready",
      {
        deviceId: selectedDevice?.deviceId,
        deviceName: selectedDevice?.deviceName,
        platform: selectedDevice?.platform,
      }
    );

    const cleanup = onDevToolsEvent(function (type, queryHash, metadata) {
      const actionName = type.toLowerCase().replace(/_/g, " ");
      logger.info(`🎯 Dev Tools Action Handled: ${actionName}`, {
        deviceId: selectedDevice?.deviceId,
        deviceName: selectedDevice?.deviceName,
        platform: selectedDevice?.platform,
      });

      // Convert DevTools action type to Query action type
      const queryActionType = actionTypeToQueryAction[type];
      if (!queryActionType) {
        logger.warn("⚠️ Unknown action type: " + type, {
          deviceId: selectedDevice?.deviceId,
          deviceName: selectedDevice?.deviceName,
          platform: selectedDevice?.platform,
        });
        return;
      }

      // Get the query from cache if we have a hash
      const query = queryHash
        ? queryClient.getQueryCache().get(queryHash)
        : undefined;
      if (
        !query &&
        type !== "CLEAR_QUERY_CACHE" &&
        type !== "CLEAR_MUTATION_CACHE"
      ) {
        logger.warn("⚠️ Query not found in cache: " + queryHash, {
          deviceId: selectedDevice?.deviceId,
          deviceName: selectedDevice?.deviceName,
          platform: selectedDevice?.platform,
        });
        return;
      }

      logger.info(
        `📤 Forwarding ${queryActionType} to device: ${
          selectedDevice.deviceName ?? "Unknown Device"
        }`,
        {
          deviceId: selectedDevice?.deviceId,
          deviceName: selectedDevice?.deviceName,
          platform: selectedDevice?.platform,
        }
      );

      // Special handling for cache clear actions which don't require a query
      if (type === "CLEAR_QUERY_CACHE" || type === "CLEAR_MUTATION_CACHE") {
        sendQueryAction(socket, selectedDevice, queryActionType, {
          queryHash: "",
          queryKey: undefined,
          state: { data: undefined },
        });
        return;
      }

      // For all other actions, ensure we have a valid query
      if (!query || !queryHash) {
        logger.warn("⚠️ Skipping action due to missing query or queryHash", {
          deviceId: selectedDevice?.deviceId,
          deviceName: selectedDevice?.deviceName,
          platform: selectedDevice?.platform,
        });
        return;
      }

      sendQueryAction(socket, selectedDevice, queryActionType, {
        queryHash: query.queryHash,
        queryKey: query.queryKey,
        state: { data: query.state.data },
      });
    });

    return () => {
      logger.debug("🧹 Cleaning up dev tools event handler", {
        deviceId: selectedDevice?.deviceId,
        deviceName: selectedDevice?.deviceName,
        platform: selectedDevice?.platform,
      });
      cleanup();
    };
  }, [isConnected, socket, selectedDevice, sendQueryAction, queryClient]);
};
