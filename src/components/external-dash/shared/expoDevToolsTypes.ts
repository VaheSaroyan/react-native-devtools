import { User } from "../types/User";

/**
 * Types of Expo DevTools commands that can be triggered remotely
 */
export type ExpoCommandType = 
  | "reload" 
  | "toggle-inspector"
  | "toggle-performance-monitor"
  | "toggle-element-inspector"
  | "clear-cache"
  | "toggle-remote-debugging"
  | "open-dev-menu"
  | "take-screenshot"
  | "shake-device";

/**
 * Status of an Expo command execution
 */
export type ExpoCommandStatus = 
  | "pending" 
  | "success" 
  | "error";

/**
 * Interface for Expo DevTools commands
 */
export interface ExpoCommand {
  id: string;
  type: ExpoCommandType;
  status: ExpoCommandStatus;
  timestamp: number;
  deviceId: string;
  error?: string;
  result?: any;
}

/**
 * Message structure for Expo command actions from dashboard to devices
 */
export interface ExpoCommandActionMessage {
  action: "ACTION-EXECUTE-EXPO-COMMAND";
  targetDeviceId: string;
  command: ExpoCommandType;
  commandId: string;
}

/**
 * Message structure for Expo command results from devices to dashboard
 */
export interface ExpoCommandResultMessage {
  type: "expo-command-result";
  persistentDeviceId: string;
  command: ExpoCommand;
}

/**
 * Message structure for requesting Expo DevTools status from devices
 */
export interface ExpoDevToolsRequestMessage {
  type: "request-expo-devtools-status";
  targetDeviceId: string;
}

/**
 * State structure for Expo DevTools store
 */
export interface ExpoDevToolsState {
  commands: Record<string, ExpoCommand[]>;
  isVisible: boolean;
  isLoading: boolean;
}
