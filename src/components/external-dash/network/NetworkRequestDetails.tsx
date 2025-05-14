import React, { useState } from 'react';
import { NetworkRequest } from '../shared/networkTypes';
import { NetworkRequestIcon, getRequestTypeColor } from './NetworkRequestIcon';
import { NetworkRequestStatusBadge } from './NetworkRequestStatusBadge';
import { formatDate, formatDuration, formatJSON } from './networkUtils';

interface NetworkRequestDetailsProps {
  request: NetworkRequest | undefined;
}

type TabType = 'headers' | 'request' | 'response';

export const NetworkRequestDetails: React.FC<NetworkRequestDetailsProps> = ({ request }) => {
  const [activeTab, setActiveTab] = useState<TabType>('headers');

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#A1A1A6] p-6 text-center">
        <svg
          className="w-16 h-16 mb-4 text-[#2D2D2F]"
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
        <p className="text-lg mb-2">Select a request to view details</p>
        <p className="text-sm max-w-md">
          Click on a request from the list on the left to view its details.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Request info header */}
      <div className="px-6 py-4 border-b border-[#2D2D2F]/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${getRequestTypeColor(request.type)}`}>
              <NetworkRequestIcon type={request.type} />
            </span>
            <h3 className="text-lg font-medium text-white">
              {request.method || (request.type === 'websocket' ? 'WebSocket' : request.type.toUpperCase())}
            </h3>
            <NetworkRequestStatusBadge request={request} />
          </div>
          <div className="text-sm text-[#A1A1A6]">
            {formatDate(request.startTime)}
            {request.duration && (
              <span className="ml-2">({formatDuration(request.duration)})</span>
            )}
          </div>
        </div>
        <div className="font-mono text-sm text-[#A1A1A6] break-all">
          {request.url}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2D2D2F]/50">
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-6 py-3 text-sm font-medium transition-colors duration-300 ${
            activeTab === 'headers'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-[#A1A1A6] hover:text-white'
          }`}
        >
          Headers
        </button>
        <button
          onClick={() => setActiveTab('request')}
          className={`px-6 py-3 text-sm font-medium transition-colors duration-300 ${
            activeTab === 'request'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-[#A1A1A6] hover:text-white'
          }`}
        >
          Request
        </button>
        <button
          onClick={() => setActiveTab('response')}
          className={`px-6 py-3 text-sm font-medium transition-colors duration-300 ${
            activeTab === 'response'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-[#A1A1A6] hover:text-white'
          }`}
        >
          Response
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'headers' && (
          <div className="text-sm text-white">
            <h4 className="font-medium mb-2">Request URL</h4>
            <div className="font-mono bg-[#1A1A1C] p-3 rounded mb-4 break-all">
              {request.url}
            </div>
            
            <h4 className="font-medium mb-2">Request Method</h4>
            <div className="font-mono bg-[#1A1A1C] p-3 rounded mb-4">
              {request.method || 'N/A'}
            </div>
            
            <h4 className="font-medium mb-2">Status</h4>
            <div className="font-mono bg-[#1A1A1C] p-3 rounded mb-4">
              {request.status === 'pending' 
                ? 'Pending' 
                : ('responseStatus' in request && request.responseStatus)
                  ? request.responseStatus
                  : request.status}
            </div>
            
            {'headers' in request && request.headers && (
              <>
                <h4 className="font-medium mb-2">Headers</h4>
                <div className="font-mono bg-[#1A1A1C] p-3 rounded mb-4 whitespace-pre-wrap">
                  {formatJSON(request.headers)}
                </div>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'request' && (
          <div className="text-sm text-white">
            {request.status === 'pending' && !('requestBody' in request && request.requestBody) ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#A1A1A6]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-4"></div>
                <p>Request is being prepared...</p>
              </div>
            ) : 'requestBody' in request && request.requestBody ? (
              <>
                <h4 className="font-medium mb-2">Request Body</h4>
                <div className="font-mono bg-[#1A1A1C] p-3 rounded mb-4 whitespace-pre-wrap overflow-auto max-h-96">
                  {formatJSON(request.requestBody)}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-[#A1A1A6]">
                <p>No request body available</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'response' && (
          <div className="text-sm text-white">
            {request.status === 'pending' ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#A1A1A6]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-4"></div>
                <p>Request is pending...</p>
              </div>
            ) : 'responseBody' in request && request.responseBody ? (
              <>
                <h4 className="font-medium mb-2">Response Body</h4>
                <div className="font-mono bg-[#1A1A1C] p-3 rounded mb-4 whitespace-pre-wrap overflow-auto max-h-96">
                  {formatJSON(request.responseBody)}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-[#A1A1A6]">
                <p>No response body available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
