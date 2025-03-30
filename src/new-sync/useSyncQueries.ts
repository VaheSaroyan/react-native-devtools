import { useEffect, useRef } from 'react';
import type { QueryKey } from '@tanstack/query-core';
import { onlineManager, QueryClient } from '@tanstack/react-query';

import { Dehydrate } from './hydration';
import { SyncMessage } from './types';
import useMySocket from './useMySocket';
// Use type-only imports to prevent runtime dependencies
type QueryActions =
  | 'ACTION-REFETCH'
  | 'ACTION-INVALIDATE'
  | 'ACTION-TRIGGER-ERROR'
  | 'ACTION-RESTORE-ERROR'
  | 'ACTION-RESET'
  | 'ACTION-REMOVE'
  | 'ACTION-TRIGGER-LOADING'
  | 'ACTION-RESTORE-LOADING'
  | 'ACTION-DATA-UPDATE'
  | 'ACTION-ONLINE-MANAGER-ONLINE'
  | 'ACTION-ONLINE-MANAGER-OFFLINE'
  | 'success';
interface QueryActionMessage {
  queryHash: string;
  queryKey: QueryKey;
  data: unknown;
  action: QueryActions;
  targetDevice: string;
}

function shouldProcessMessage(targetDevice: string, currentDeviceName: string): boolean {
  const shouldProcess = targetDevice === currentDeviceName || targetDevice === 'All';
  return shouldProcess;
}

function checkVersion(queryClient: QueryClient) {
  // Basic version check
  const version = (
    queryClient as unknown as { getDefaultOptions?: () => { queries?: { version?: unknown } } }
  ).getDefaultOptions?.()?.queries?.version;
  if (version && !version.toString().startsWith('4') && !version.toString().startsWith('5')) {
    console.warn(
      'This version of React Query has not been tested with the dev tools plugin. Some features might not work as expected.',
    );
  }
}
interface DeviceInfoMessage {
  deviceName: string;
}
interface useSyncQueriesProps {
  queryClient: QueryClient;
  deviceName: string;
  socketURL: string;
}
export function useSyncQueriesExternal({ queryClient, deviceName, socketURL }: useSyncQueriesProps) {
  const { connect, disconnect, isConnected, socket, users } = useMySocket({
    deviceName,
    socketURL,
  });

  // Use a ref to track previous connection state to avoid duplicate logs
  const prevConnectedRef = useRef(false);

  useEffect(() => {
    checkVersion(queryClient);

    // Only log connection state changes to reduce noise
    if (prevConnectedRef.current !== isConnected) {
      if (!isConnected) {
        console.log(deviceName, 'Not connected to external dashboard');
      } else {
        console.log(deviceName, 'Connected to external dashboard');
      }
      prevConnectedRef.current = isConnected;
    }

    // Don't proceed with setting up event handlers if not connected
    if (!isConnected || !socket) {
      return;
    }

    // Handle initial state requests from dashboard
    const initialStateSubscription = socket.on('request-initial-state', () => {
      console.log(deviceName, 'Dashboard is requesting initial state');
      const dehydratedState = Dehydrate(queryClient as unknown as QueryClient);
      const syncMessage: SyncMessage = {
        type: 'dehydrated-state',
        state: dehydratedState,
        deviceName,
        isOnlineManagerOnline: onlineManager.isOnline(),
      };
      socket.emit('query-sync', syncMessage);
    });
    // Online manager handler - Turn device internet connection on/off
    const onlineManagerSubscription = socket.on('online-manager', (message: QueryActionMessage) => {
      const { action, targetDevice } = message;
      // Only process if the target device is the current device or "All"
      if (targetDevice !== deviceName && targetDevice !== 'All') {
        return;
      }
      switch (action) {
        case 'ACTION-ONLINE-MANAGER-ONLINE': {
          onlineManager.setOnline(true);
          break;
        }
        case 'ACTION-ONLINE-MANAGER-OFFLINE': {
          onlineManager.setOnline(false);
          break;
        }
      }
    });
    // Query Actions handler - Update query data, trigger errors, etc.
    const queryActionSubscription = socket.on('query-action', (message: QueryActionMessage) => {
      console.log(deviceName, 'Dashboard is sending query-action');
      const { queryHash, queryKey, data, action, targetDevice } = message;

      // Centralize the device check
      if (!shouldProcessMessage(targetDevice, deviceName)) {
        return;
      }

      const activeQuery = queryClient.getQueryCache().get(queryHash);
      if (!activeQuery) {
        console.warn(`Query with hash ${queryHash} not found`);
        return;
      }

      switch (action) {
        case 'ACTION-DATA-UPDATE': {
          queryClient.setQueryData(queryKey, data, {
            updatedAt: Date.now(),
          });
          break;
        }

        case 'ACTION-TRIGGER-ERROR': {
          const error = new Error('Unknown error from devtools');

          const __previousQueryOptions = activeQuery.options;
          activeQuery.setState({
            status: 'error',
            error,
            fetchMeta: {
              ...activeQuery.state.fetchMeta,
              // @ts-expect-error This does exist
              __previousQueryOptions,
            },
          });
          break;
        }
        case 'ACTION-RESTORE-ERROR': {
          queryClient.resetQueries(activeQuery);
          break;
        }
        case 'ACTION-TRIGGER-LOADING': {
          if (!activeQuery) return;
          const __previousQueryOptions = activeQuery.options;
          // Trigger a fetch in order to trigger suspense as well.
          activeQuery.fetch({
            ...__previousQueryOptions,
            queryFn: () => {
              return new Promise(() => {
                // Never resolve
              });
            },
            gcTime: -1,
          });
          activeQuery.setState({
            data: undefined,
            status: 'pending',
            fetchMeta: {
              ...activeQuery.state.fetchMeta,
              // @ts-expect-error This does exist
              __previousQueryOptions,
            },
          });
          break;
        }
        case 'ACTION-RESTORE-LOADING': {
          const previousState = activeQuery.state;
          const previousOptions = activeQuery.state.fetchMeta
            ? (activeQuery.state.fetchMeta as unknown as { __previousQueryOptions: unknown }).__previousQueryOptions
            : null;

          activeQuery.cancel({ silent: true });
          activeQuery.setState({
            ...previousState,
            fetchStatus: 'idle',
            fetchMeta: null,
          });

          if (previousOptions) {
            activeQuery.fetch(previousOptions);
          }
          break;
        }
        case 'ACTION-RESET': {
          queryClient.resetQueries(activeQuery);
          break;
        }
        case 'ACTION-REMOVE': {
          queryClient.removeQueries(activeQuery);
          break;
        }
        case 'ACTION-REFETCH': {
          const promise = activeQuery.fetch();
          promise.catch(() => {});
          break;
        }
        case 'ACTION-INVALIDATE': {
          queryClient.invalidateQueries(activeQuery);
          break;
        }
        case 'ACTION-ONLINE-MANAGER-ONLINE': {
          onlineManager.setOnline(true);
          break;
        }
        case 'ACTION-ONLINE-MANAGER-OFFLINE': {
          onlineManager.setOnline(false);
          break;
        }
      }
    });

    // Subscribe to query changes - Send query state to dashboard
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // Dehydrate the current state
      const dehydratedState = Dehydrate(queryClient as unknown as QueryClient);
      // Create sync message
      const syncMessage: SyncMessage = {
        type: 'dehydrated-state',
        state: dehydratedState,
        deviceName,
        isOnlineManagerOnline: onlineManager.isOnline(),
      };
      // Send message to dashboard
      socket.emit('query-sync', syncMessage);
    });
    // Handle device info request - Send device info to dashboard
    const deviceInfoSubscription = socket.on('device-request', () => {
      const syncMessage: DeviceInfoMessage = {
        deviceName,
      };
      socket.emit('device-info', syncMessage);
    });
    return () => {
      queryActionSubscription?.off();
      initialStateSubscription?.off();
      onlineManagerSubscription?.off();
      unsubscribe();
      deviceInfoSubscription?.off();
    };
  }, [queryClient, socket, deviceName, isConnected]);

  return { connect, disconnect, isConnected, socket, users };
}
