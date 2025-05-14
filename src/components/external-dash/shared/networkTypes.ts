import { User } from "../types/User";

/**
 * Types of network requests that can be monitored
 */
export type NetworkRequestType = 
  | "fetch" 
  | "xhr" 
  | "websocket" 
  | "graphql";

/**
 * Status of a network request
 */
export type NetworkRequestStatus = 
  | "pending" 
  | "success" 
  | "error";

/**
 * Direction of WebSocket messages
 */
export type WebSocketDirection = 
  | "sent" 
  | "received";

/**
 * Base interface for all network requests
 */
export interface BaseNetworkRequest {
  id: string;
  url: string;
  method?: string;
  type: NetworkRequestType;
  status: NetworkRequestStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  persistentDeviceId: string;
}

/**
 * Interface for HTTP requests (fetch/XHR)
 */
export interface HttpNetworkRequest extends BaseNetworkRequest {
  type: "fetch" | "xhr";
  method: string;
  headers?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  responseStatus?: number;
  responseStatusText?: string;
  responseHeaders?: Record<string, string>;
  contentType?: string;
  contentLength?: number;
}

/**
 * Interface for WebSocket messages
 */
export interface WebSocketNetworkRequest extends BaseNetworkRequest {
  type: "websocket";
  direction: WebSocketDirection;
  data?: any;
  messageType?: string;
}

/**
 * Interface for GraphQL requests
 */
export interface GraphQLNetworkRequest extends BaseNetworkRequest {
  type: "graphql";
  method: string;
  operationName?: string;
  operationType?: "query" | "mutation" | "subscription";
  variables?: any;
  response?: any;
  responseStatus?: number;
}

/**
 * Union type for all network request types
 */
export type NetworkRequest = 
  | HttpNetworkRequest 
  | WebSocketNetworkRequest 
  | GraphQLNetworkRequest;

/**
 * Message structure for network request sync from devices to dashboard
 */
export interface NetworkRequestSyncMessage {
  type: "network-request-sync";
  request: NetworkRequest;
  persistentDeviceId: string;
}

/**
 * Message structure for requesting network requests from devices
 */
export interface NetworkRequestMessage {
  type: "request-network-monitoring";
  targetDeviceId: string;
}

/**
 * Message structure for network monitoring actions from dashboard to devices
 */
export interface NetworkMonitoringActionMessage {
  action: "ACTION-ENABLE-NETWORK-MONITORING" | "ACTION-DISABLE-NETWORK-MONITORING";
  targetDeviceId: string;
}

/**
 * State structure for network request store
 */
export interface NetworkRequestState {
  requests: NetworkRequest[];
  isEnabled: boolean;
}
