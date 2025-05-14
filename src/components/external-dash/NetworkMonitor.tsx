import React, { useState } from 'react';
import { useNetworkStore, getFilteredRequestsForDevice, getRequestById } from './utils/networkStore';
import { useNetworkMonitoringHandler } from './hooks/useNetworkMonitoringHandler';
import { User } from './types/User';
import { Socket } from 'socket.io-client';
import { NetworkRequestList } from './network/NetworkRequestList';
import { NetworkRequestDetails } from './network/NetworkRequestDetails';

interface NetworkMonitorProps {
  isConnected?: boolean;
  socket?: Socket;
  selectedDevice?: User;
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({
  isConnected,
  socket,
  selectedDevice,
}) => {
  const {
    requestsByDevice,
    isVisible,
    isLoading,
    selectedRequestId,
    searchQuery,
    filterType,
    setSelectedRequestId,
    setSearchQuery,
    setFilterType,
    setIsVisible,
  } = useNetworkStore();

    const {
    enableNetworkMonitoring,
    disableNetworkMonitoring,
    clearNetworkRequests,
    refresh,
  } = useNetworkMonitoringHandler({
    isConnected,
    socket,
    selectedDevice,
  });

  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(true);

  // Get filtered requests for the selected device
  const requests = selectedDevice
    ? getFilteredRequestsForDevice(
        requestsByDevice,
        selectedDevice.deviceId,
        searchQuery,
        filterType
      )
    : [];

  // Get the selected request
  const selectedRequest = selectedDevice && selectedRequestId
    ? getRequestById(
        requestsByDevice,
        selectedDevice.deviceId,
        selectedRequestId
      )
    : undefined;

  // Handle refresh button click
  const handleRefresh = () => {
    refresh();
  };

  // Handle clear all button click
  const handleClearRequests = () => {
    clearNetworkRequests();
  };

  // Handle monitoring toggle
  const handleMonitoringToggle = () => {
    if (isMonitoringEnabled) {
      disableNetworkMonitoring();
    } else {
      enableNetworkMonitoring();
    }
    setIsMonitoringEnabled(!isMonitoringEnabled);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 flex items-center justify-center w-12 h-12 bg-[#1A1A1C] hover:bg-[#2D2D2F] text-[#F5F5F7] rounded-full shadow-[0_0.5rem_1rem_rgba(0,0,0,0.2)] border border-[#2D2D2F]/50 transition-all duration-500 ease-out hover:scale-110 hover:shadow-[0_0.5rem_1.5rem_rgba(59,130,246,0.2)]"
      >
          <svg width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M23.5 6C23.5 3.37665 21.3734 1.25 18.75 1.25H6.75C4.12665 1.25 2 3.37665 2 6V18C2 20.6234 4.12665 22.75 6.75 22.75H18.75C21.3734 22.75 23.5 20.6234 23.5 18V6ZM18.75 2.75C20.5449 2.75 22 4.20507 22 6V18C22 19.7949 20.5449 21.25 18.75 21.25H6.75C4.95507 21.25 3.5 19.7949 3.5 18V6C3.5 4.20507 4.95507 2.75 6.75 2.75H18.75Z" fill="#fff"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.21967 7.46967C9.51256 7.17678 9.98744 7.17678 10.2803 7.46967L12.2803 9.46967C12.5732 9.76256 12.5732 10.2374 12.2803 10.5303C11.9874 10.8232 11.5126 10.8232 11.2197 10.5303L10.5 9.81066V16C10.5 16.4142 10.1642 16.75 9.75 16.75C9.33579 16.75 9 16.4142 9 16V9.81066L8.28033 10.5303C7.98744 10.8232 7.51256 10.8232 7.21967 10.5303C6.92678 10.2374 6.92678 9.76256 7.21967 9.46967L9.21967 7.46967Z" fill="#fff"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.2803 16.5303C15.9874 16.8232 15.5126 16.8232 15.2197 16.5303L13.2197 14.5303C12.9268 14.2374 12.9268 13.7626 13.2197 13.4697C13.5126 13.1768 13.9874 13.1768 14.2803 13.4697L15 14.1893L15 8C15 7.58579 15.3358 7.25 15.75 7.25C16.1642 7.25 16.5 7.58579 16.5 8L16.5 14.1893L17.2197 13.4697C17.5126 13.1768 17.9874 13.1768 18.2803 13.4697C18.5732 13.7626 18.5732 14.2374 18.2803 14.5303L16.2803 16.5303Z" fill="#fff"/>
          </svg>


      </button>
    );
  }

    return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-[#0A0A0C] border-t border-[#2D2D2F]/50 shadow-2xl transition-all duration-500 ease-out transform animate-slideUpFade">
      <div className="flex flex-col h-[60vh] max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D2F]/50">
          <div className="flex items-center gap-3">

              <svg  className="w-5 h-5 text-blue-400" width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.5 6C23.5 3.37665 21.3734 1.25 18.75 1.25H6.75C4.12665 1.25 2 3.37665 2 6V18C2 20.6234 4.12665 22.75 6.75 22.75H18.75C21.3734 22.75 23.5 20.6234 23.5 18V6ZM18.75 2.75C20.5449 2.75 22 4.20507 22 6V18C22 19.7949 20.5449 21.25 18.75 21.25H6.75C4.95507 21.25 3.5 19.7949 3.5 18V6C3.5 4.20507 4.95507 2.75 6.75 2.75H18.75Z" fill="currentColor"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M9.21967 7.46967C9.51256 7.17678 9.98744 7.17678 10.2803 7.46967L12.2803 9.46967C12.5732 9.76256 12.5732 10.2374 12.2803 10.5303C11.9874 10.8232 11.5126 10.8232 11.2197 10.5303L10.5 9.81066V16C10.5 16.4142 10.1642 16.75 9.75 16.75C9.33579 16.75 9 16.4142 9 16V9.81066L8.28033 10.5303C7.98744 10.8232 7.51256 10.8232 7.21967 10.5303C6.92678 10.2374 6.92678 9.76256 7.21967 9.46967L9.21967 7.46967Z" fill="currentColor"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.2803 16.5303C15.9874 16.8232 15.5126 16.8232 15.2197 16.5303L13.2197 14.5303C12.9268 14.2374 12.9268 13.7626 13.2197 13.4697C13.5126 13.1768 13.9874 13.1768 14.2803 13.4697L15 14.1893L15 8C15 7.58579 15.3358 7.25 15.75 7.25C16.1642 7.25 16.5 7.58579 16.5 8L16.5 14.1893L17.2197 13.4697C17.5126 13.1768 17.9874 13.1768 18.2803 13.4697C18.5732 13.7626 18.5732 14.2374 18.2803 14.5303L16.2803 16.5303Z" fill="currentColor"/>
              </svg>

              <h2 className="text-lg font-medium text-white">Network Monitor</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMonitoringToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-500 ease-out ${
                isMonitoringEnabled
                  ? 'bg-green-900/20 text-green-400 border border-green-900/30'
                  : 'bg-red-900/20 text-red-400 border border-red-900/30'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isMonitoringEnabled ? 'bg-green-400' : 'bg-red-400'
                }`}
              ></div>
              <span className="text-xs font-medium">
                {isMonitoringEnabled ? 'Monitoring' : 'Paused'}
              </span>
            </button>
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
          {/* Left panel - Requests list */}
          <NetworkRequestList
            requests={requests}
            selectedRequestId={selectedRequestId}
            isLoading={isLoading}
            searchQuery={searchQuery}
            filterType={filterType}
            onSelectRequest={setSelectedRequestId}
            onClearRequests={handleClearRequests}
            onFilterChange={setFilterType}
            onSearchChange={setSearchQuery}
          />

          {/* Right panel - Request details */}
          <div className="w-2/3 flex flex-col">
            <NetworkRequestDetails request={selectedRequest} />
          </div>
        </div>
      </div>
    </div>
  );
};
