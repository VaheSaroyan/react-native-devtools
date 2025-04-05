export interface User {
  id: string;
  deviceName: string;
  deviceId: string; // Persisted device ID
  platform?: string; // Device platform (iOS, Android, Web)
  isConnected?: boolean; // Whether the device is currently connected
  extraDeviceInfo?: Record<string, string>; // Additional device information as key-value pairs
}
