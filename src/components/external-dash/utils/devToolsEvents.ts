import { logger } from "./logger";

export type DevToolsActionType =
  | "REFETCH"
  | "INVALIDATE"
  | "RESET"
  | "REMOVE"
  | "TRIGGER_ERROR"
  | "RESTORE_ERROR"
  | "TRIGGER_LOADING"
  | "RESTORE_LOADING"
  | "CLEAR_MUTATION_CACHE"
  | "CLEAR_QUERY_CACHE";

interface DevToolsEventDetail {
  type: DevToolsActionType;
  queryHash?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export const DEV_TOOLS_EVENT = "@tanstack/query-devtools-event";

// For the external dev tools to use in their onClick handlers
export const sendDevToolsEvent = ({
  type,
  queryHash,
  metadata,
}: DevToolsEventDetail) => {
  logger.debug(
    `📤 Sending dev tools event - Type: ${type}, QueryHash: ${queryHash}`
  );
  const event = new CustomEvent<DevToolsEventDetail>(DEV_TOOLS_EVENT, {
    detail: {
      type,
      queryHash: queryHash ?? undefined,
      metadata: metadata ?? undefined,
    },
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
  logger.debug("✅ Event dispatched successfully");
};

type DevToolsEventCallback = (
  type: DevToolsActionType,
  queryHash: string | undefined,
  metadata: Record<string, unknown> | undefined
) => void;

// For our app to listen to events
export const onDevToolsEvent = (callback: DevToolsEventCallback) => {
  logger.debug("🎧 Setting up dev tools event listener for " + DEV_TOOLS_EVENT);

  const handler = (event: CustomEvent<DevToolsEventDetail>) => {
    const { type, queryHash, metadata } = event.detail;
    logger.debug(
      `📥 Received dev tools event - Type: ${type}, QueryHash: ${queryHash}`
    );
    callback(type, queryHash ?? undefined, metadata ?? undefined);
  };

  window.addEventListener(DEV_TOOLS_EVENT, handler as EventListener);

  return () => {
    logger.debug("🛑 Removing dev tools event listener");
    window.removeEventListener(DEV_TOOLS_EVENT, handler as EventListener);
  };
};
