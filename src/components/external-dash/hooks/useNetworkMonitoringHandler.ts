import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '../types/User';
import { useNetworkStore } from '../utils/networkStore';
import {
  NetworkRequestSyncMessage,
  NetworkMonitoringActionMessage,
  NetworkRequestMessage
} from '../shared/networkTypes';
import { logger } from '../utils/logger';

interface UseNetworkMonitoringHandlerProps {
  isConnected?: boolean;
  socket?: Socket;
  selectedDevice?: User;
}

/**
 * Helper function to send network monitoring actions to devices
 */
export const sendNetworkMonitoringAction = (
  socket: Socket,
  targetDevice: User,
  action: 'ACTION-ENABLE-NETWORK-MONITORING' | 'ACTION-DISABLE-NETWORK-MONITORING'
) => {
  const message: NetworkMonitoringActionMessage = {
    action,
    targetDeviceId: targetDevice.deviceId,
  };
  socket.emit('network-monitoring-action', message);
};

/**
 * Helper function to request network monitoring state from devices
 */
export const requestNetworkMonitoringState = (
  socket: Socket,
  targetDeviceId: string
) => {
  const message: NetworkRequestMessage = {
    type: 'request-network-monitoring',
    targetDeviceId,
  };
  socket.emit('request-network-monitoring', message);
};

/**
 * Hook to handle network request monitoring
 */
export const useNetworkMonitoringHandler = ({
  isConnected,
  socket,
  selectedDevice,
}: UseNetworkMonitoringHandlerProps = {}) => {
  const {
    addRequestForDevice,
    setRequestsForDevice,
    clearRequestsForDevice,
    setIsLoading
  } = useNetworkStore();

  const isReadyRef = useRef(false);

  // Track when all dependencies are ready
  useEffect(() => {
    isReadyRef.current = !!(isConnected && socket && selectedDevice);
    logger.debug('🔍 NetworkMonitoringHandler Ready State:', {
      deviceId: selectedDevice?.deviceId,
      deviceName: selectedDevice?.deviceName,
      platform: selectedDevice?.platform,
    });
  }, [isConnected, socket, selectedDevice]);

  // Set up socket listeners for network request events
  useEffect(() => {
    if (!isReadyRef.current || !socket) {
      return;
    }

    logger.debug('🔄 Setting up network monitoring event handlers', {
      deviceId: selectedDevice?.deviceId,
      deviceName: selectedDevice?.deviceName,
    });

    // Listen for network request updates
    const handleNetworkRequestSync = (message: NetworkRequestSyncMessage) => {
      logger.debug(
        `📥 Received network request from device ${message.persistentDeviceId}: ${message.request.type} ${message.request.method || ''} ${message.request.url} (${message.request.status})`,
        {
          deviceId: message.persistentDeviceId,
        }
      );
      
      // Add the request to the store - the store will handle updating existing requests
      addRequestForDevice(message.persistentDeviceId, message.request);
      
      // If this is a completed request (success or error), set loading to false
      if (message.request.status !== 'pending') {
        setIsLoading(false);
      }
    };

    // Set up socket listeners
    socket.on('network-request-sync', handleNetworkRequestSync);

    // Request initial network monitoring state if we have a selected device
    if (selectedDevice && selectedDevice.deviceId !== 'All') {
      logger.debug('🔄 Requesting initial network monitoring state', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      setIsLoading(true);
      requestNetworkMonitoringState(socket, selectedDevice.deviceId);
    }

    // Clean up listeners when component unmounts or dependencies change
    return () => {
      logger.debug('🧹 Cleaning up network monitoring event handlers');
      socket.off('network-request-sync', handleNetworkRequestSync);
    };
  }, [
    isConnected,
    socket,
    selectedDevice,
    addRequestForDevice,
    setRequestsForDevice,
    clearRequestsForDevice,
    setIsLoading
  ]);

  // Return functions to interact with network monitoring
  return {
    // Enable network monitoring
    enableNetworkMonitoring: () => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot enable network monitoring - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot enable network monitoring - "All" devices selected');
        return;
      }

      logger.debug('🔄 Enabling network monitoring', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      sendNetworkMonitoringAction(socket, selectedDevice, 'ACTION-ENABLE-NETWORK-MONITORING');
    },

    // Disable network monitoring
    disableNetworkMonitoring: () => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot disable network monitoring - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot disable network monitoring - "All" devices selected');
        return;
      }

      logger.debug('🔄 Disabling network monitoring', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      sendNetworkMonitoringAction(socket, selectedDevice, 'ACTION-DISABLE-NETWORK-MONITORING');
    },

    // Clear network requests
    clearNetworkRequests: () => {
      if (!isReadyRef.current || !selectedDevice) {
        logger.warn('⚠️ Cannot clear network requests - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot clear network requests - "All" devices selected');
        return;
      }

      logger.debug('🔄 Clearing network requests', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      clearRequestsForDevice(selectedDevice.deviceId);
    },

    // Refresh network monitoring state
    refresh: () => {
      if (!isReadyRef.current || !socket || !selectedDevice) {
        logger.warn('⚠️ Cannot refresh network monitoring - dependencies not ready');
        return;
      }

      if (selectedDevice.deviceId === 'All') {
        logger.warn('⚠️ Cannot refresh network monitoring - "All" devices selected');
        return;
      }

      logger.debug('🔄 Refreshing network monitoring state', {
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.deviceName,
      });

      setIsLoading(true);
      requestNetworkMonitoringState(socket, selectedDevice.deviceId);
    },
  };
};
