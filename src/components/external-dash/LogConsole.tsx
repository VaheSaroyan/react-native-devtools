import React, { useEffect, useRef, useState } from "react";
import { useLogStore, LogEntry, LogLevel } from "./utils/logStore";
import { PlatformIcon } from "./utils/platformUtils";

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

export const LogConsole: React.FC = () => {
  const logs = useLogStore((state: { logs: LogEntry[] }) => state.logs);
  const clearLogs = useLogStore(
    (state: { clearLogs: () => void }) => state.clearLogs
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  // Auto-scroll functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Scroll to top since we render newest logs first
    }
  }, [logs, autoScroll]);

  // Filter logs based on level
  const filteredLogs =
    filter === "all"
      ? logs
      : logs.filter((log: LogEntry) => log.level === filter);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-0 right-0 w-full bg-gray-900 text-gray-200 border-t border-gray-700 shadow-lg z-20">
        <div
          className="px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-800"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
            <span className="font-medium">Console ({logs.length} logs)</span>
          </div>
          <span className="text-gray-400 text-xs">Click to expand</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full bg-gray-900 text-gray-200 border-t border-gray-700 shadow-lg z-20">
      {/* Header */}
      <div className="px-4 py-2 flex justify-between items-center border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-850">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="font-medium">Console ({logs.length} logs)</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Filter controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Filter:</span>
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

          {/* Collapse button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Log entries container */}
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto flex flex-col-reverse" // Flex-col-reverse to show newest at top
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
    </div>
  );
};
