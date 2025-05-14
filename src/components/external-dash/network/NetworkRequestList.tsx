import React from 'react';
import { NetworkRequest } from '../shared/networkTypes';
import { NetworkRequestIcon, getRequestTypeColor } from './NetworkRequestIcon';
import { NetworkRequestStatusBadge } from './NetworkRequestStatusBadge';
import { formatDate, formatDuration } from './networkUtils';

interface NetworkRequestListProps {
  requests: NetworkRequest[];
  selectedRequestId: string | null;
  isLoading: boolean;
  searchQuery: string;
  filterType: string | null;
  onSelectRequest: (id: string) => void;
  onClearRequests: () => void;
  onFilterChange: (type: string | null) => void;
  onSearchChange: (query: string) => void;
}

export const NetworkRequestList: React.FC<NetworkRequestListProps> = ({
  requests,
  selectedRequestId,
  isLoading,
  searchQuery,
  filterType,
  onSelectRequest,
  onClearRequests,
  onFilterChange,
  onSearchChange,
}) => {
  const [confirmClear, setConfirmClear] = React.useState(false);

  // Handle clear all button click
  const handleClearAll = () => {
    if (confirmClear) {
      onClearRequests();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className="w-1/3 border-r border-[#2D2D2F]/50 flex flex-col">
      {/* Search and filters */}
      <div className="p-4 border-b border-[#2D2D2F]/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search requests..."
              className="w-full px-3 py-2 bg-[#1A1A1C] border border-[#2D2D2F] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#A1A1A6] hover:text-white"
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
            )}
          </div>
        </div>

        {/* Request type filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => onFilterChange(null)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
              filterType === null
                ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50'
                : 'bg-[#1A1A1C] text-[#A1A1A6] border border-[#2D2D2F]/50 hover:bg-[#2D2D2F]/30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('fetch')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
              filterType === 'fetch'
                ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50'
                : 'bg-[#1A1A1C] text-[#A1A1A6] border border-[#2D2D2F]/50 hover:bg-[#2D2D2F]/30'
            }`}
          >
            <NetworkRequestIcon type="fetch" />
            Fetch
          </button>
          <button
            onClick={() => onFilterChange('xhr')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
              filterType === 'xhr'
                ? 'bg-purple-900/30 text-purple-400 border border-purple-900/50'
                : 'bg-[#1A1A1C] text-[#A1A1A6] border border-[#2D2D2F]/50 hover:bg-[#2D2D2F]/30'
            }`}
          >
            <NetworkRequestIcon type="xhr" />
            XHR
          </button>
          <button
            onClick={() => onFilterChange('websocket')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
              filterType === 'websocket'
                ? 'bg-green-900/30 text-green-400 border border-green-900/50'
                : 'bg-[#1A1A1C] text-[#A1A1A6] border border-[#2D2D2F]/50 hover:bg-[#2D2D2F]/30'
            }`}
          >
            <NetworkRequestIcon type="websocket" />
            WebSocket
          </button>
          <button
            onClick={() => onFilterChange('graphql')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
              filterType === 'graphql'
                ? 'bg-pink-900/30 text-pink-400 border border-pink-900/50'
                : 'bg-[#1A1A1C] text-[#A1A1A6] border border-[#2D2D2F]/50 hover:bg-[#2D2D2F]/30'
            }`}
          >
            <NetworkRequestIcon type="graphql" />
            GraphQL
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A1A1A6]">
            {requests.length} {requests.length === 1 ? 'request' : 'requests'}
          </span>
          <button
            onClick={handleClearAll}
            className={`text-xs px-2 py-1 rounded ${
              confirmClear
                ? 'bg-red-500 text-white'
                : 'bg-[#1A1A1C] text-red-400 hover:bg-[#2D2D2F]'
            } transition-colors duration-300`}
          >
            {confirmClear ? 'Confirm Clear' : 'Clear All'}
          </button>
        </div>
      </div>

      {/* Requests list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#A1A1A6] p-4 text-center">
            <svg
              className="w-12 h-12 mb-4 text-[#2D2D2F]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">No network requests found</p>
            <p className="text-xs mt-2">
              {searchQuery || filterType
                ? 'Try different search terms or filters'
                : 'Make some network requests in your app to see them here'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#2D2D2F]/30">
            {requests.map((request) => (
              <li
                key={request.id}
                className={`px-4 py-3 cursor-pointer transition-colors duration-300 ${
                  selectedRequestId === request.id
                    ? 'bg-blue-900/20 border-l-2 border-blue-500'
                    : 'hover:bg-[#1A1A1C] border-l-2 border-transparent'
                }`}
                onClick={() => onSelectRequest(request.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`${getRequestTypeColor(request.type)}`}>
                      <NetworkRequestIcon type={request.type} />
                    </span>
                    <span className="text-sm font-medium text-white">
                      {request.method || (request.type === 'websocket' ? 'WS' : request.type.toUpperCase())}
                    </span>
                    <NetworkRequestStatusBadge request={request} />
                  </div>
                  <span className="text-xs text-[#A1A1A6]">
                    {formatDate(request.startTime)}
                  </span>
                </div>
                <div className="font-mono text-xs text-[#A1A1A6] truncate">
                  {request.url}
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-[#A1A1A6]">
                    {request.status === 'pending' 
                      ? 'Pending...' 
                      : request.duration 
                        ? formatDuration(request.duration) 
                        : 'Completed'}
                  </span>
                  {'contentLength' in request && request.contentLength && (
                    <span className="text-[#A1A1A6]">
                      {request.contentLength < 1024
                        ? `${request.contentLength} B`
                        : `${Math.round(request.contentLength / 1024)} KB`}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
