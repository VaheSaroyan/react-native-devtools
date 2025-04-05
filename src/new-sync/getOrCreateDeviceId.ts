import { getStorage } from "./platformUtils";
// Key for storing the persistent device ID in AsyncStorage
const DEVICE_ID_STORAGE_KEY = "@rn_better_dev_tools_device_id";

// Store the deviceId in memory as well
let deviceId: string | null = null;

/**
 * Generates a pseudo-random device ID
 */
const generateDeviceId = (): string => {
  return `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
};

/**
 * Gets or creates a persistent device ID
 */
export const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    // Check if we already have the ID in memory
    if (deviceId) {
      return deviceId;
    }

    // Get the storage implementation
    const storage = getStorage();

    // Try to get from storage
    const storedId = await storage.getItem(DEVICE_ID_STORAGE_KEY);

    if (storedId) {
      deviceId = storedId;
      return storedId;
    }

    // Generate and store a new ID if not found
    const newId = generateDeviceId();
    await storage.setItem(DEVICE_ID_STORAGE_KEY, newId);
    deviceId = newId;
    return newId;
  } catch (error) {
    console.error("Failed to get/create device ID:", error);
    // Fallback to a temporary ID if storage fails
    const tempId = generateDeviceId();
    deviceId = tempId;
    return tempId;
  }
};
