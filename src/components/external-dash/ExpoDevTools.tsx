import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { User } from './types/User';
import { useExpoDevToolsStore, getCommandsForDevice } from './utils/expoDevToolsStore';
import { useExpoDevToolsHandler } from './hooks/useExpoDevToolsHandler';
import { ExpoCommandType } from './shared/expoDevToolsTypes';

interface ExpoDevToolsProps {
  isConnected?: boolean;
  socket?: Socket;
  selectedDevice?: User;
}

// Command configuration with icons and descriptions
const EXPO_COMMANDS: Array<{
  type: ExpoCommandType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'reload',
    label: 'Reload',
    description: 'Reload the app',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    type: 'toggle-inspector',
    label: 'Inspector',
    description: 'Toggle the element inspector',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
      </svg>
    ),
  },
  {
    type: 'toggle-performance-monitor',
    label: 'Performance',
    description: 'Toggle the performance monitor',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    type: 'toggle-element-inspector',
    label: 'Elements',
    description: 'Toggle the element inspector',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    type: 'clear-cache',
    label: 'Clear Cache',
    description: 'Clear the app cache',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    type: 'toggle-remote-debugging',
    label: 'Remote Debug',
    description: 'Toggle remote debugging',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'open-dev-menu',
    label: 'Dev Menu',
    description: 'Open the developer menu',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    type: 'take-screenshot',
    label: 'Screenshot',
    description: 'Take a screenshot',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    type: 'shake-device',
    label: 'Shake',
    description: 'Shake the device',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
];

export const ExpoDevTools: React.FC<ExpoDevToolsProps> = ({
  isConnected,
  socket,
  selectedDevice,
}) => {
  const {
    commands,
    isVisible,
    isLoading,
    setIsVisible,
  } = useExpoDevToolsStore();

  const {
    executeCommand,
    clearCommandHistory,
    refresh,
  } = useExpoDevToolsHandler({
    isConnected,
    socket,
    selectedDevice,
  });

  // Get commands for the selected device
  const deviceCommands = selectedDevice
    ? getCommandsForDevice(commands, selectedDevice.deviceId)
    : [];

  // Handle command execution
  const handleExecuteCommand = (commandType: ExpoCommandType) => {
    executeCommand(commandType);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refresh();
  };

  // Handle clear history button click
  const handleClearHistory = () => {
    clearCommandHistory();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-36 left-4 flex items-center justify-center w-12 h-12 bg-[#1A1A1C] hover:bg-[#2D2D2F] text-[#F5F5F7] rounded-full shadow-[0_0.5rem_1rem_rgba(0,0,0,0.2)] border border-[#2D2D2F]/50 transition-all duration-500 ease-out hover:scale-110 hover:shadow-[0_0.5rem_1.5rem_rgba(59,130,246,0.2)]"
        title="Expo DevTools"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-[#0A0A0C] border-t border-[#2D2D2F]/50 shadow-2xl transition-all duration-500 ease-out transform animate-slideUpFade">
      <div className="flex flex-col h-[50vh] max-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D2F]/50">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-medium text-white">Expo DevTools</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center w-8 h-8 text-[#F5F5F7] bg-[#1A1A1C] hover:bg-[#2D2D2F] rounded-full transition-colors duration-300"
              title="Refresh"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="flex items-center justify-center w-8 h-8 text-[#F5F5F7] bg-[#1A1A1C] hover:bg-[#2D2D2F] rounded-full transition-colors duration-300"
              title="Close"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Command buttons */}
          <div className="w-full p-6">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Remote Commands</h3>
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 text-xs font-medium text-red-300 bg-red-900/20 rounded-full border border-red-900/30 hover:bg-red-900/30 transition-colors duration-300"
              >
                Clear History
              </button>
            </div>

            {/* Command grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {EXPO_COMMANDS.map((cmd) => (
                <button
                  key={cmd.type}
                  onClick={() => handleExecuteCommand(cmd.type)}
                  disabled={isLoading}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
                    isLoading
                      ? 'bg-[#1A1A1C]/50 border-[#2D2D2F]/30 text-[#A1A1A6]/50 cursor-not-allowed'
                      : 'bg-[#1A1A1C] border-[#2D2D2F]/50 text-[#F5F5F7] hover:bg-[#2D2D2F] hover:border-[#3D3D3F] hover:shadow-lg transition-all duration-300'
                  }`}
                  title={cmd.description}
                >
                  <div className={`mb-2 ${isLoading ? 'text-[#A1A1A6]/50' : 'text-blue-400'}`}>
                    {cmd.icon}
                  </div>
                  <span className="text-sm font-medium">{cmd.label}</span>
                </button>
              ))}
            </div>

            {/* Command history */}
            {deviceCommands.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-3">Command History</h3>
                <div className="bg-[#1A1A1C] border border-[#2D2D2F]/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2D2D2F]/50">
                        <th className="px-4 py-2 text-left text-[#A1A1A6]">Command</th>
                        <th className="px-4 py-2 text-left text-[#A1A1A6]">Status</th>
                        <th className="px-4 py-2 text-left text-[#A1A1A6]">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deviceCommands.slice(0, 5).map((cmd) => (
                        <tr key={cmd.id} className="border-b border-[#2D2D2F]/30">
                          <td className="px-4 py-2 text-[#F5F5F7]">
                            {cmd.type}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                cmd.status === 'success'
                                  ? 'bg-green-900/20 text-green-300'
                                  : cmd.status === 'error'
                                  ? 'bg-red-900/20 text-red-300'
                                  : 'bg-yellow-900/20 text-yellow-300'
                              }`}
                            >
                              {cmd.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-[#A1A1A6]">
                            {new Date(cmd.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
