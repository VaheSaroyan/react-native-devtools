import { create } from 'zustand';
import { NetworkRequest, NetworkRequestState } from '../shared/networkTypes';

interface NetworkStoreState {
  // Store network requests by device ID
  requestsByDevice: Record<string, NetworkRequestState>;

  // UI state
  isVisible: boolean;
  isLoading: boolean;
  selectedRequestId: string | null;
  searchQuery: string;
  filterType: string | null; // 'fetch', 'xhr', 'websocket', 'graphql', or null for all

  // Actions
  addRequestForDevice: (deviceId: string, request: NetworkRequest) => void;
  setRequestsForDevice: (deviceId: string, state: NetworkRequestState) => void;
  clearRequestsForDevice: (deviceId: string) => void;
  setIsVisible: (isVisible: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedRequestId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: string | null) => void;
  clearAllRequests: () => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  // Initial state
  requestsByDevice: {},
  isVisible: false,
  isLoading: false,
  selectedRequestId: null,
  searchQuery: '',
  filterType: null,

  // Actions
  addRequestForDevice: (deviceId, request) =>
    set((prevState) => {
      const deviceState = prevState.requestsByDevice[deviceId] || { requests: [], isEnabled: true };
        // Check if a request with the same ID already exists
      const existingRequestIndex = deviceState.requests.findIndex(r => r.id === request.id);
        let updatedRequests;
      if (existingRequestIndex !== -1) {
        // Update the existing request instead of adding a new one
        updatedRequests = [...deviceState.requests];
        updatedRequests[existingRequestIndex] = request;
      } else {
        // Add the new request to the beginning of the array
        updatedRequests = [request, ...deviceState.requests].slice(0, 1000); // Limit to 1000 requests
      }
        return {
        requestsByDevice: {
          ...prevState.requestsByDevice,
          [deviceId]: {
            ...deviceState,
            requests: updatedRequests,
          },
        },
      };
    }),

  setRequestsForDevice: (deviceId, state) =>
    set((prevState) => ({
      requestsByDevice: {
        ...prevState.requestsByDevice,
        [deviceId]: state,
      },
    })),

  clearRequestsForDevice: (deviceId) =>
    set((prevState) => {
      const deviceState = prevState.requestsByDevice[deviceId];
      if (!deviceState) return prevState;

      return {
        requestsByDevice: {
          ...prevState.requestsByDevice,
          [deviceId]: {
            ...deviceState,
            requests: [],
          },
        },
      };
    }),

  setIsVisible: (isVisible) => set({ isVisible }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedRequestId: (selectedRequestId) => set({ selectedRequestId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterType: (filterType) => set({ filterType }),

  clearAllRequests: () =>
    set((prevState) => {
      const newRequestsByDevice: Record<string, NetworkRequestState> = {};

      // Preserve the enabled state for each device but clear requests
      Object.entries(prevState.requestsByDevice).forEach(([deviceId, state]) => {
        newRequestsByDevice[deviceId] = {
          ...state,
          requests: [],
        };
      });

      return { requestsByDevice: newRequestsByDevice };
    }),
}));

// Helper function to get filtered requests for a device
export const getFilteredRequestsForDevice = (
  requestsByDevice: Record<string, NetworkRequestState>,
  deviceId: string,
  searchQuery: string,
  filterType: string | null
): NetworkRequest[] => {
  const deviceState = requestsByDevice[deviceId];
  if (!deviceState) return [];

  let requests = deviceState.requests;

  // Apply type filter if specified
  if (filterType) {
    requests = requests.filter(request => request.type === filterType);
  }

  // Apply search query if specified
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    requests = requests.filter(request => {
      // Search in URL
      if (request.url.toLowerCase().includes(lowerQuery)) return true;

      // Search in request body if it exists
      if ('requestBody' in request && request.requestBody) {
        const requestBodyStr = typeof request.requestBody === 'string'
          ? request.requestBody
          : JSON.stringify(request.requestBody);
        if (requestBodyStr.toLowerCase().includes(lowerQuery)) return true;
      }

      // Search in response body if it exists
      if ('responseBody' in request && request.responseBody) {
        const responseBodyStr = typeof request.responseBody === 'string'
          ? request.responseBody
          : JSON.stringify(request.responseBody);
        if (responseBodyStr.toLowerCase().includes(lowerQuery)) return true;
      }

      // Search in WebSocket data if it exists
      if ('data' in request && request.data) {
        const dataStr = typeof request.data === 'string'
          ? request.data
          : JSON.stringify(request.data);
        if (dataStr.toLowerCase().includes(lowerQuery)) return true;
      }

      return false;
    });
  }

  return requests;
};

// Helper function to get a specific request by ID
export const getRequestById = (
  requestsByDevice: Record<string, NetworkRequestState>,
  deviceId: string,
  requestId: string
): NetworkRequest | undefined => {
  const deviceState = requestsByDevice[deviceId];
  if (!deviceState) return undefined;

  return deviceState.requests.find(request => request.id === requestId);
};
