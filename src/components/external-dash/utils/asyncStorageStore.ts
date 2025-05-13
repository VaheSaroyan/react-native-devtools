import { create } from 'zustand';
import { AsyncStorageItem, AsyncStorageState } from '../shared/asyncStorageTypes';

interface AsyncStorageStoreState {
  // Store AsyncStorage state by device ID
  storageByDevice: Record<string, AsyncStorageState>;
  
  // UI state
  isVisible: boolean;
  isLoading: boolean;
  selectedKey: string | null;
  searchQuery: string;
  
  // Actions
  setStorageForDevice: (deviceId: string, state: AsyncStorageState) => void;
  clearStorageForDevice: (deviceId: string) => void;
  setIsVisible: (isVisible: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedKey: (key: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useAsyncStorageStore = create<AsyncStorageStoreState>((set) => ({
  // Initial state
  storageByDevice: {},
  isVisible: false,
  isLoading: false,
  selectedKey: null,
  searchQuery: '',
  
  // Actions
  setStorageForDevice: (deviceId, state) => 
    set((prevState) => ({
      storageByDevice: {
        ...prevState.storageByDevice,
        [deviceId]: state,
      },
    })),
  
  clearStorageForDevice: (deviceId) =>
    set((prevState) => {
      const newStorageByDevice = { ...prevState.storageByDevice };
      delete newStorageByDevice[deviceId];
      return { storageByDevice: newStorageByDevice };
    }),
  
  setIsVisible: (isVisible) => set({ isVisible }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedKey: (selectedKey) => set({ selectedKey }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

// Helper function to get filtered items for a device
export const getFilteredItemsForDevice = (
  storageByDevice: Record<string, AsyncStorageState>,
  deviceId: string,
  searchQuery: string
): AsyncStorageItem[] => {
  const deviceStorage = storageByDevice[deviceId];
  if (!deviceStorage) return [];
  
  const items = deviceStorage.items;
  if (!searchQuery) return items;
  
  const lowerQuery = searchQuery.toLowerCase();
  return items.filter(
    (item) => 
      item.key.toLowerCase().includes(lowerQuery) || 
      item.value.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to get a specific item by key
export const getItemByKey = (
  storageByDevice: Record<string, AsyncStorageState>,
  deviceId: string,
  key: string
): AsyncStorageItem | undefined => {
  const deviceStorage = storageByDevice[deviceId];
  if (!deviceStorage) return undefined;
  
  return deviceStorage.items.find((item) => item.key === key);
};
