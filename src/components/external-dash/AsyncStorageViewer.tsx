import React, { useState, useEffect } from 'react';
import { useAsyncStorageStore, getFilteredItemsForDevice } from './utils/asyncStorageStore';
import { useAsyncStorageHandler } from './hooks/useAsyncStorageHandler';
import { User } from './types/User';
import { Socket } from 'socket.io-client';

interface AsyncStorageViewerProps {
  isConnected?: boolean;
  socket?: Socket;
  selectedDevice?: User;
}

export const AsyncStorageViewer: React.FC<AsyncStorageViewerProps> = ({
  isConnected,
  socket,
  selectedDevice,
}) => {
  const {
    storageByDevice,
    isVisible,
    isLoading,
    selectedKey,
    searchQuery,
    setSelectedKey,
    setSearchQuery,
    setIsVisible,
  } = useAsyncStorageStore();

  const {
    setItem,
    removeItem,
    clearAll,
    refresh,
  } = useAsyncStorageHandler({
    isConnected,
    socket,
    selectedDevice,
  });

  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Get filtered items for the selected device
  const items = selectedDevice
    ? getFilteredItemsForDevice(
        storageByDevice,
        selectedDevice.deviceId,
        searchQuery
      )
    : [];

  // Reset editing state when selected key changes
  useEffect(() => {
    if (selectedKey) {
      const item = items.find((item) => item.key === selectedKey);
      if (item) {
        setEditValue(item.value);
      }
    }
    setIsEditing(false);
  }, [selectedKey, items]);

  // Handle refresh button click
  const handleRefresh = () => {
    refresh();
  };

  // Handle save button click
  const handleSave = () => {
    if (selectedKey && editValue !== undefined) {
      setItem(selectedKey, editValue);
      setIsEditing(false);
    }
  };

  // Handle delete button click
  const handleDelete = () => {
    if (selectedKey) {
      removeItem(selectedKey);
      setSelectedKey(null);
    }
  };

  // Handle add button click
  const handleAdd = () => {
    if (newKey && newValue) {
      setItem(newKey, newValue);
      setNewKey('');
      setNewValue('');
      setIsAdding(false);
    }
  };

  // Handle clear all button click
  const handleClearAll = () => {
    if (confirmClear) {
      clearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 z-40 flex items-center justify-center w-12 h-12 bg-[#1A1A1C] hover:bg-[#2D2D2F] text-[#F5F5F7] rounded-full shadow-[0_0.5rem_1rem_rgba(0,0,0,0.2)] border border-[#2D2D2F]/50 transition-all duration-500 ease-out hover:scale-110 hover:shadow-[0_0.5rem_1.5rem_rgba(59,130,246,0.2)]"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16"
          />
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
            <svg
              className="w-5 h-5 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16"
              />
            </svg>
            <h2 className="text-lg font-medium text-white">AsyncStorage Viewer</h2>
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
          {/* Left panel - Keys list */}
          <div className="w-1/3 border-r border-[#2D2D2F]/50 flex flex-col">
            {/* Search and actions */}
            <div className="p-4 border-b border-[#2D2D2F]/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keys or values..."
                    className="w-full px-3 py-2 bg-[#1A1A1C] border border-[#2D2D2F] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
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
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setSelectedKey(null);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300"
                  title="Add new key"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A1A1A6]">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
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

            {/* Keys list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : items.length === 0 ? (
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
                      d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16"
                    />
                  </svg>
                  <p className="text-sm">No AsyncStorage items found</p>
                  <p className="text-xs mt-2">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Add a new item to get started'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#2D2D2F]/30">
                  {items.map((item) => (
                    <li
                      key={item.key}
                      className={`px-4 py-3 cursor-pointer transition-colors duration-300 ${
                        selectedKey === item.key
                          ? 'bg-blue-900/20 border-l-2 border-blue-500'
                          : 'hover:bg-[#1A1A1C] border-l-2 border-transparent'
                      }`}
                      onClick={() => setSelectedKey(item.key)}
                    >
                      <div className="font-mono text-sm text-white truncate">
                        {item.key}
                      </div>
                      <div className="text-xs text-[#A1A1A6] truncate mt-1">
                        {item.value.length > 50
                          ? `${item.value.substring(0, 50)}...`
                          : item.value}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right panel - Value editor */}
          <div className="w-2/3 flex flex-col">
            {isAdding ? (
              <div className="flex flex-col h-full p-6">
                <h3 className="text-lg font-medium text-white mb-4">Add New Item</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#A1A1A6] mb-1">
                    Key
                  </label>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter key name"
                    className="w-full px-3 py-2 bg-[#1A1A1C] border border-[#2D2D2F] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mb-4 flex-1">
                  <label className="block text-sm font-medium text-[#A1A1A6] mb-1">
                    Value
                  </label>
                  <textarea
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full h-full px-3 py-2 bg-[#1A1A1C] border border-[#2D2D2F] rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 bg-[#1A1A1C] hover:bg-[#2D2D2F] text-white rounded-lg transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newKey || !newValue}
                    className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                      !newKey || !newValue
                        ? 'bg-blue-500/50 text-white/50 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Add Item
                  </button>
                </div>
              </div>
            ) : selectedKey ? (
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">
                    <span className="text-[#A1A1A6] mr-2">Key:</span>
                    <span className="font-mono">{selectedKey}</span>
                  </h3>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1 bg-[#1A1A1C] hover:bg-[#2D2D2F] text-white text-sm rounded-lg transition-colors duration-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-300"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-3 py-1 bg-[#1A1A1C] hover:bg-[#2D2D2F] text-white text-sm rounded-lg transition-colors duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors duration-300"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {isEditing ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full h-full px-4 py-3 bg-[#1A1A1C] border border-[#2D2D2F] rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  ) : (
                    <div className="w-full h-full px-4 py-3 bg-[#1A1A1C] border border-[#2D2D2F] rounded-lg text-white font-mono text-sm overflow-auto whitespace-pre-wrap">
                      {items.find((item) => item.key === selectedKey)?.value || ''}
                    </div>
                  )}
                </div>
              </div>
            ) : (
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
                    d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16"
                  />
                </svg>
                <p className="text-lg mb-2">Select an item to view</p>
                <p className="text-sm max-w-md">
                  Click on an item from the list on the left to view and edit its value,
                  or click the + button to add a new item.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
