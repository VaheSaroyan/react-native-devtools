// Export the main hooks
export { useMySocket as useQuerySyncSocket } from "./useMySocket";
export { useSyncQueriesExternal } from "./useSyncQueries";

// Export network monitoring utilities
export {
  sendNetworkRequest,
  setupFetchInterceptor,
  setupXHRInterceptor,
  setupWebSocketInterceptor,
  setupNetworkInterceptors
} from "./sendNetworkRequest";
