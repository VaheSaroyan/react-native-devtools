import React from 'react';
import { NetworkRequestType } from '../shared/networkTypes';

interface NetworkRequestIconProps {
  type: NetworkRequestType;
}

export const NetworkRequestIcon: React.FC<NetworkRequestIconProps> = ({ type }) => {
  switch (type) {
    case 'fetch':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
        </svg>
      );
    case 'xhr':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z" />
        </svg>
      );
    case 'websocket':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h-2v-6h2v6zm0-8h-2V8h2v2zm4 8h-2v-8h2v8zm0-10h-2V8h2v2z" />
        </svg>
      );
    case 'graphql':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 18l-8-4V8l8 4v8zm0-10L4 6l8-4 8 4-8 4zm8 6l-8 4V10l8-4v10z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-2h7v2zm7-4H5v-2h14v2zm0-4H5V7h14v2z" />
        </svg>
      );
  }
};

export const getRequestTypeColor = (type: NetworkRequestType): string => {
  switch (type) {
    case 'fetch':
      return 'text-blue-400';
    case 'xhr':
      return 'text-purple-400';
    case 'websocket':
      return 'text-green-400';
    case 'graphql':
      return 'text-pink-400';
    default:
      return 'text-gray-400';
  }
};
