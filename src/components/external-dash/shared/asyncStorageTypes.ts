import { User } from "../types/User";
import { Socket } from "socket.io-client";

// Types for AsyncStorage operations
export interface AsyncStorageItem {
  key: string;
  value: string;
}

export interface AsyncStorageState {
  items: AsyncStorageItem[];
  timestamp: number;
}

// Message sent from React Native app to DevTools
export interface AsyncStorageSyncMessage {
  type: "async-storage-state";
  state: AsyncStorageState;
  persistentDeviceId: string;
}

// Message sent from DevTools to React Native app
export interface AsyncStorageActionMessage {
  type: "async-storage-action";
  action: AsyncStorageActionType;
  targetDeviceId: string;
  key?: string;
  value?: string;
}

// Message to request initial AsyncStorage state
export interface AsyncStorageRequestMessage {
  type: "request-async-storage";
  targetDeviceId: string;
}

// Action types for AsyncStorage operations
export type AsyncStorageActionType =
  | "GET_ALL_KEYS"
  | "GET_ITEM"
  | "SET_ITEM"
  | "REMOVE_ITEM"
  | "CLEAR_ALL";

// Function to send AsyncStorage action to a device
export const sendAsyncStorageAction = (
  socket: Socket,
  targetDevice: User,
  action: AsyncStorageActionType,
  key?: string,
  value?: string
) => {
  if (!socket || !targetDevice) {
    console.error("Socket or target device not available");
    return;
  }

  const message: AsyncStorageActionMessage = {
    type: "async-storage-action",
    action,
    targetDeviceId: targetDevice.deviceId,
    key,
    value,
  };

  socket.emit("async-storage-action", message);
};

// Function to request initial AsyncStorage state
export const requestAsyncStorageState = (
  socket: Socket,
  targetDeviceId: string
) => {
  if (!socket) {
    console.error("Socket not available");
    return;
  }

  const message: AsyncStorageRequestMessage = {
    type: "request-async-storage",
    targetDeviceId,
  };
    console.log({message});
    socket.emit("request-async-storage", message);
};
