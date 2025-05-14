import { create } from 'zustand';
import { ExpoCommand, ExpoCommandStatus, ExpoCommandType, ExpoDevToolsState } from '../shared/expoDevToolsTypes';
import { logger } from './logger';

// Simple function to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface ExpoDevToolsStore extends ExpoDevToolsState {
  // Command management
  addCommandForDevice: (deviceId: string, command: ExpoCommand) => void;
  updateCommandStatus: (deviceId: string, commandId: string, status: ExpoCommandStatus, result?: any, error?: string) => void;
  clearCommandsForDevice: (deviceId: string) => void;
  
  // UI state
  setIsVisible: (isVisible: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  // Command creation helper
  createCommand: (deviceId: string, type: ExpoCommandType) => ExpoCommand;
}

export const useExpoDevToolsStore = create<ExpoDevToolsStore>((set, get) => ({
  commands: {},
  isVisible: false,
  isLoading: false,

  // Add a command for a specific device
  addCommandForDevice: (deviceId: string, command: ExpoCommand) => {
    logger.debug(`Adding Expo command for device ${deviceId}: ${command.type}`, {
      deviceId,
    });

    set((state) => {
      const deviceCommands = state.commands[deviceId] || [];
      return {
        commands: {
          ...state.commands,
          [deviceId]: [...deviceCommands, command],
        },
      };
    });
  },

  // Update the status of a command
  updateCommandStatus: (deviceId: string, commandId: string, status: ExpoCommandStatus, result?: any, error?: string) => {
    logger.debug(`Updating Expo command status for device ${deviceId}: ${commandId} -> ${status}`, {
      deviceId,
    });

    set((state) => {
      const deviceCommands = state.commands[deviceId] || [];
      const updatedCommands = deviceCommands.map((cmd) => {
        if (cmd.id === commandId) {
          return {
            ...cmd,
            status,
            ...(result !== undefined ? { result } : {}),
            ...(error !== undefined ? { error } : {}),
          };
        }
        return cmd;
      });

      return {
        commands: {
          ...state.commands,
          [deviceId]: updatedCommands,
        },
      };
    });
  },

  // Clear all commands for a device
  clearCommandsForDevice: (deviceId: string) => {
    logger.debug(`Clearing Expo commands for device ${deviceId}`, {
      deviceId,
    });

    set((state) => ({
      commands: {
        ...state.commands,
        [deviceId]: [],
      },
    }));
  },

  // Set visibility of the Expo DevTools panel
  setIsVisible: (isVisible: boolean) => {
    set({ isVisible });
  },

  // Set loading state
  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  // Helper to create a new command
  createCommand: (deviceId: string, type: ExpoCommandType): ExpoCommand => {
    const command: ExpoCommand = {
      id: generateId(),
      type,
      status: 'pending',
      timestamp: Date.now(),
      deviceId,
    };
    return command;
  },
}));

// Helper function to get commands for a specific device
export const getCommandsForDevice = (
  commands: Record<string, ExpoCommand[]>,
  deviceId: string
): ExpoCommand[] => {
  return commands[deviceId] || [];
};

// Helper function to get a command by ID for a specific device
export const getCommandById = (
  commands: Record<string, ExpoCommand[]>,
  deviceId: string,
  commandId: string
): ExpoCommand | undefined => {
  const deviceCommands = commands[deviceId] || [];
  return deviceCommands.find((cmd) => cmd.id === commandId);
};
