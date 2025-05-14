import React from 'react';
import { NetworkRequest } from '../shared/networkTypes';

interface NetworkRequestStatusBadgeProps {
  request: NetworkRequest;
}

export const NetworkRequestStatusBadge: React.FC<NetworkRequestStatusBadgeProps> = ({ request }) => {
  const { status } = request;
  
  let bgColor = 'bg-gray-800';
  let textColor = 'text-gray-400';
  
  if (status === 'success') {
    bgColor = 'bg-green-900/30';
    textColor = 'text-green-400';
  } else if (status === 'error') {
    bgColor = 'bg-red-900/30';
    textColor = 'text-red-400';
  } else if (status === 'pending') {
    bgColor = 'bg-yellow-900/30';
    textColor = 'text-yellow-400';
  }
  
  // For HTTP requests, also show the status code if available and not in pending state
  let statusText: string = status;
  if (status !== 'pending' && 'responseStatus' in request && request.responseStatus) {
    statusText = String(request.responseStatus);
  }
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {statusText}
    </span>
  );
};
