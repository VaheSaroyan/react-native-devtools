import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

import { User } from './User';

interface Props {
  deviceName: string;
  socketURL: string;
}

// Create a singleton socket instance that persists across component renders
let globalSocketInstance: Socket | null = null;
let currentSocketURL = '';

export default function useMySocket({ deviceName, socketURL }: Props) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const initialized = useRef(false);

  // Main socket initialization - runs only once
  useEffect(() => {
    // Only initialize socket once
    if (initialized.current) {
      return;
    }

    initialized.current = true;
    currentSocketURL = socketURL;

    // Use existing global socket or create a new one
    if (!globalSocketInstance) {
      console.log(deviceName, 'Creating new socket instance');
      globalSocketInstance = io(socketURL, {
        autoConnect: true,
        query: { deviceName },
        reconnection: false,
      });
    } else {
      console.log(deviceName, 'Reusing existing socket instance');
    }

    socketRef.current = globalSocketInstance;
    setSocket(socketRef.current);

    // Check initial connection state
    if (socketRef.current.connected) {
      setIsConnected(true);
      console.log(deviceName, 'Socket already connected on init');
    }

    function onConnect() {
      console.log(deviceName, 'Socket connected');
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log(deviceName, 'Socket disconnected');
      setIsConnected(false);
    }

    // Set up event handlers
    socketRef.current.on('connect', onConnect);
    socketRef.current.on('disconnect', onDisconnect);
    socketRef.current.on('users-update', (newUsers: User[]) => {
      setUsers(newUsers);
    });

    // Clean up event listeners on unmount but don't disconnect
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', onConnect);
        socketRef.current.off('disconnect', onDisconnect);
        socketRef.current.off('users-update');
        // Don't disconnect socket on component unmount
        // We want it to remain connected for the app's lifetime
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run once

  // Update the socket query parameters when deviceName changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.io.opts.query) {
      socketRef.current.io.opts.query = { ...socketRef.current.io.opts.query, deviceName };
    }
  }, [deviceName]);

  // Update the socket URL when socketURL changes
  useEffect(() => {
    // Compare with last known URL to avoid direct property access
    if (socketRef.current && currentSocketURL !== socketURL) {
      // Only recreate socket if URL actually changed
      socketRef.current.disconnect();
      currentSocketURL = socketURL;

      globalSocketInstance = io(socketURL, {
        autoConnect: true,
        query: { deviceName },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketRef.current = globalSocketInstance;
      setSocket(socketRef.current);
    }
  }, [socketURL, deviceName]);

  function connect() {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }

  function disconnect() {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
    }
  }

  return {
    socket,
    connect,
    disconnect,
    isConnected,
    users,
  };
}
