import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '../types/User';
import { useExpoDevToolsStore } from '../utils/expoDevToolsStore';
import {
  ExpoCommandType,
  ExpoCommandActionMessage,
  ExpoCommandResultMessage,
  ExpoDevToolsRequestMessage
} from '../shared/expoDevToolsTypes';
import { logger } from '../utils/logger';

interface UseExpoDevToolsHandlerProps {
  isConnected?: boolean;
  socket?: Socket;
  selectedDevice?: User;
}

/**
 * Helper function to send Expo DevTools commands to devices
 */
export const sendExpoCommand = (
  socket: Socket,
  targetDevice: User,
  command: ExpoCommandType,
  commandId: string
) => {
  const message: ExpoCommandActionMessage = {
    action: 'ACTION-EXECUTE-EXPO-COMMAND',
    targetDeviceId: targetDevice.deviceId,
    command,
    commandId
  };
  socket.emit('expo-command-action', message);
};

/**
 * Helper function to request Expo DevTools status from devices
 */
export const requestExpoDevToolsStatus = (
  socket: Socket,
  targetDeviceId: string
) => {
  const message: ExpoDevToolsRequestMessage = {
    type: 'request-expo-devtools-status',
    targetDeviceId,
  };
  socket.emit('request-expo-devtools-status', message);
};

/**
 * Hook to handle Expo DevTools commands
 */
export const useExpoDevToolsHandler = ({
  isConnected,
  socket,
  selectedDevice,
}: UseExpoDevToolsHandlerProps = {}) => {
  const {
    addCommandForDevice,
    updateCommandStatus,
    clearCommandsForDevice,
    createCommand,
    setIsLoading
  } = useExpoDevToolsStore();

  const isReadyRef = useRef(false);

  // Track when all dependencies are ready
  useEffect(() => {
    isReadyRef.current = !!(isConnected && socket && selectedDevice);
    logger.debug('🔍 ExpoDevToolsHandler Ready State:', {
      deviceId: selectedDevice?.deviceId,
      deviceName: selectedDevice?.deviceName,
      platform: selectedDevice?.platform,
    });
  }, [isConnected, socket, selectedDevice]);

  // Set up socket listeners for Expo command events
  useEffect(() => {
    if (!isReadyRef.current || !socket) {
      return;
    }

    logger.debug('🔄 Setting up Expo DevTools event handlers', {
      deviceId: selectedDevice?.deviceId,
      deviceName: selectedDevice?.deviceName,
    });

    // Listen for command result updates
    const handleExpoCommandResult = (message: ExpoCommandResultMessage) => {
      logger.debug(
        `📥 Received Expo command result from device ${message.persistentDeviceId}: ${message.command.type} (${message.command.status})`,
        {
          deviceId: message.persistentDeviceId,
        }
      );
      
      // Update the command status in the store
      updateCommandStatus(
        message.persistentDeviceId,
        message.command.id,
        message.command.status,
        message.command.result,
        message.command.error
      );
      
      // If this is a completed command (success or error), set loading to false
      if (message.command.status !== 'pending') {
        setIsLoading(false);
      }
    };

    // Set up socket listeners
    socket.on('expo-command-result', handleExpoCommandResult);

    // Request initial Expo DevTools status if we have a selected device
    if (selectedDevice && selectedDevice.deviceId !== 'All') {
      logger.debug('🔄 Requesting initial Expo DevTools status', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      setIsLoading(true);
      requestExpoDevToolsStatus(socket, selectedDevice.deviceId);
    }

    // Clean up listeners when component unmounts or dependencies change
    return () => {
      logger.debug('🧹 Cleaning up Expo DevTools event handlers');
      socket.off('expo-command-result', handleExpoCommandResult);
    };
  }, [
    isConnected,
    socket,
    selectedDevice,
    addCommandForDevice,
    updateCommandStatus,
    clearCommandsForDevice,
    setIsLoading
  ]);

  // Return functions to interact with Expo DevTools
  return {
    // Execute an Expo command
    executeCommand: (commandType: ExpoCommandType) => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot execute Expo command - dependencies not ready');
        return null;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot execute Expo command - "All" devices selected');
        return null;
      }

      logger.debug(`🔄 Executing Expo command: ${commandType}`, {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      // Create a new command
      const command = createCommand(selectedDevice.deviceId, commandType);
      
      // Add it to the store
      addCommandForDevice(selectedDevice.deviceId, command);
      
      // Send the command to the device
      sendExpoCommand(socket, selectedDevice, commandType, command.id);
      
      // Set loading state
      setIsLoading(true);
      
      return command;
    },

    // Clear command history
    clearCommandHistory: () => {
      if (!isReadyRef.current || !selectedDevice) {
        logger.warn('⚠️ Cannot clear command history - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot clear command history - "All" devices selected');
        return;
      }

      logger.debug('🔄 Clearing Expo command history', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      clearCommandsForDevice(selectedDevice.deviceId);
    },

    // Refresh Expo DevTools status
    refresh: () => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot refresh Expo DevTools status - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot refresh Expo DevTools status - "All" devices selected');
        return;
      }

      logger.debug('🔄 Refreshing Expo DevTools status', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      setIsLoading(true);
      requestExpoDevToolsStatus(socket, selectedDevice.deviceId);
    },
  };
};
