import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '../types/User';
import { useAsyncStorageStore } from '../utils/asyncStorageStore';
import {
  AsyncStorageSyncMessage,
  AsyncStorageActionType,
  sendAsyncStorageAction,
  requestAsyncStorageState
} from '../shared/asyncStorageTypes';
import { logger } from '../utils/logger';

interface UseAsyncStorageHandlerProps {
  isConnected?: boolean;
  socket?: Socket;
  selectedDevice?: User;
}

export const useAsyncStorageHandler = ({
  isConnected,
  socket,
  selectedDevice,
}: UseAsyncStorageHandlerProps = {}) => {
  const {
    setStorageForDevice,
    clearStorageForDevice,
    setIsLoading
  } = useAsyncStorageStore();

  const isReadyRef = useRef(false);

  // Track when all dependencies are ready
  useEffect(() => {
    isReadyRef.current = !!(isConnected && socket && selectedDevice);
    logger.debug('🔍 AsyncStorageHandler Ready State:', {
      deviceId: selectedDevice?.deviceId,
      deviceName: selectedDevice?.deviceName,
      platform: selectedDevice?.platform,
    });
  }, [isConnected, socket, selectedDevice]);

  // Set up socket listeners for AsyncStorage events
  useEffect(() => {

    if (!isReadyRef.current || !socket) {
      return;
    }

    logger.debug('🔄 Setting up AsyncStorage event handlers', {
      deviceId: selectedDevice?.deviceId,
      deviceName: selectedDevice?.deviceName,
    });

    // Listen for AsyncStorage state updates
    const handleAsyncStorageSync = (message: AsyncStorageSyncMessage) => {
      logger.debug(`📥 Received AsyncStorage sync from device ${message.persistentDeviceId} with ${message.state.items.length} items`);

      setStorageForDevice(message.persistentDeviceId, message.state);
      setIsLoading(false);
    };

    // Set up socket listeners
    socket.on('async-storage-sync', handleAsyncStorageSync);

    // Request initial AsyncStorage state if we have a selected device
    if (selectedDevice && selectedDevice.deviceId !== 'All') {
      logger.debug('🔄 Requesting initial AsyncStorage state', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      setIsLoading(true);
      requestAsyncStorageState(socket, selectedDevice.deviceId);
    }

    // Clean up listeners when component unmounts or dependencies change
    return () => {
      logger.debug('🧹 Cleaning up AsyncStorage event handlers');
      socket.off('async-storage-sync', handleAsyncStorageSync);
    };
  }, [
    isConnected,
    socket,
    selectedDevice,
    setStorageForDevice,
    clearStorageForDevice,
    setIsLoading
  ]);

  // Return functions to interact with AsyncStorage
  return {
    // Get all keys from AsyncStorage
    getAllKeys: () => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot get all keys - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot get all keys - "All" devices selected');
        return;
      }

      logger.debug('🔄 Getting all AsyncStorage keys', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      setIsLoading(true);
      sendAsyncStorageAction(socket, selectedDevice, 'GET_ALL_KEYS');
    },

    // Get a specific item from AsyncStorage
    getItem: (key: string) => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot get item - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot get item - "All" devices selected');
        return;
      }

      logger.debug(`🔄 Getting AsyncStorage item with key "${key}" for device ${selectedDevice.deviceName} (${selectedDevice.deviceId})`);

      setIsLoading(true);
      sendAsyncStorageAction(socket, selectedDevice, 'GET_ITEM', key);
    },

    // Set a value for a specific key in AsyncStorage
    setItem: (key: string, value: string) => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot set item - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot set item - "All" devices selected');
        return;
      }

      logger.debug(`🔄 Setting AsyncStorage item with key "${key}" for device ${selectedDevice.deviceName} (${selectedDevice.deviceId})`);

      setIsLoading(true);
      sendAsyncStorageAction(socket, selectedDevice, 'SET_ITEM', key, value);
    },

    // Remove a specific key from AsyncStorage
    removeItem: (key: string) => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot remove item - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot remove item - "All" devices selected');
        return;
      }

      logger.debug(`🔄 Removing AsyncStorage item with key "${key}" for device ${selectedDevice.deviceName} (${selectedDevice.deviceId})`);

      setIsLoading(true);
      sendAsyncStorageAction(socket, selectedDevice, 'REMOVE_ITEM', key);
    },

    // Clear all keys from AsyncStorage
    clearAll: () => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot clear all - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot clear all - "All" devices selected');
        return;
      }

      logger.debug('🔄 Clearing all AsyncStorage items', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      setIsLoading(true);
      sendAsyncStorageAction(socket, selectedDevice, 'CLEAR_ALL');
    },

    // Refresh AsyncStorage state
    refresh: () => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot refresh - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot refresh - "All" devices selected');
        return;
      }

      logger.debug('🔄 Refreshing AsyncStorage state', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      setIsLoading(true);
      requestAsyncStorageState(socket, selectedDevice.deviceId);
    },
  };
};
