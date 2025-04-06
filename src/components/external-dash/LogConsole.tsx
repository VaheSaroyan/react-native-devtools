import React, { useEffect, useRef, useState } from "react";
import { useLogStore, LogEntry, LogLevel } from "./utils/logStore";
import { PlatformIcon } from "./utils/platformUtils";
import { User } from "./types/User";

// Get log level color
const getLogLevelColor = (level: LogLevel): string => {
  switch (level) {
    case "error":
      return "text-red-400";
    case "warn":
      return "text-yellow-400";
    case "debug":
      return "text-purple-400";
    case "info":
    default:
      return "text-blue-400";
  }
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

interface LogEntryItemProps {
  log: LogEntry;
}

const LogEntryItem: React.FC<LogEntryItemProps> = ({ log }) => {
  return (
    <div className="py-1 font-mono text-xs border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
      <div className="flex items-start gap-2">
        {/* Timestamp */}
        <span className="text-gray-500 whitespace-nowrap min-w-[5rem] pl-2">
          {formatTimestamp(log.timestamp)}
        </span>

        {/* Log level */}
        <span
          className={`uppercase font-bold min-w-[3rem] ${getLogLevelColor(
            log.level
          )}`}
        >
          {log.level}
        </span>

        {/* Device info if available */}
        {log.platform && (
          <span className="flex items-center gap-1 text-gray-400 min-w-[8rem]">
            <PlatformIcon platform={log.platform} className="w-3 h-3" />
            <span className="truncate max-w-[7rem]">
              {log.deviceName || "Unknown"}
            </span>
          </span>
        )}

        {/* Log message */}
        <span className="text-gray-300 break-words flex-1">{log.message}</span>
      </div>
    </div>
  );
};

interface DeviceOption {
  value: string;
  label: string;
  disabled?: boolean;
  isOffline?: boolean;
  platform?: string;
}

interface LogConsoleProps {
  onClose: () => void;
  allDevices: User[];
}

export const LogConsole: React.FC<LogConsoleProps> = ({
  onClose,
  allDevices,
}) => {
  const logs = useLogStore((state: { logs: LogEntry[] }) => state.logs);
  const clearLogs = useLogStore(
    (state: { clearLogs: () => void }) => state.clearLogs
  );
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  // Auto-scroll functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  // Reset device filter if selected device is no longer available
  useEffect(() => {
    if (deviceFilter !== "all") {
      const deviceExists = allDevices.some(
        (device) => device.deviceId === deviceFilter
      );
      if (!deviceExists) {
        setDeviceFilter("all");
      }
    }
  }, [allDevices, deviceFilter]);

  // Filter logs based on level and device
  const filteredLogs = logs.filter((log: LogEntry) => {
    const matchesLevel = filter === "all" || log.level === filter;
    const matchesDevice =
      deviceFilter === "all" || log.deviceId === deviceFilter;
    return matchesLevel && matchesDevice;
  });

  // Generate device options based on available devices
  const deviceOptions: DeviceOption[] = (() => {
    if (allDevices?.length === 0) {
      return [{ value: "all", label: "All Devices" }];
    } else if (allDevices?.length === 1) {
      // Only one device, no need for "All" option
      const device = allDevices[0];
      return [
        {
          value: device.deviceId,
          label: device.deviceName || "Unknown Device",
          isOffline: !device.isConnected,
          platform: device.platform,
        },
      ];
    } else {
      // Multiple devices, include "All" option
      return [
        { value: "all", label: "All Devices" },
        ...allDevices.map((device) => ({
          value: device.deviceId,
          label: device.deviceName || "Unknown Device",
          isOffline: !device.isConnected,
          platform: device.platform,
        })),
      ];
    }
  })();

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-200">
            Console ({filteredLogs.length} logs)
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Device Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Device:</span>
            <select
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 min-w-[8rem]"
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
            >
              {deviceOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className={option.isOffline ? "text-gray-500" : ""}
                >
                  {option.label}
                  {option.platform && ` (${option.platform})`}
                  {option.isOffline ? " (Offline)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Log Level Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Level:</span>
            <select
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
              value={filter}
              onChange={(e) => setFilter(e.target.value as LogLevel | "all")}
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          {/* Auto-scroll toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Auto-scroll:</span>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                autoScroll ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                  autoScroll ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Clear button */}
          <button
            onClick={clearLogs}
            className="text-xs px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
          >
            Clear
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-md transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Log entries container */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto flex flex-col-reverse"
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log: LogEntry) => (
            <LogEntryItem key={log.id} log={log} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 italic">
            No logs to display
          </div>
        )}
      </div>
    </>
  );
};
