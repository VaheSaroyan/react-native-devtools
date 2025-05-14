// Format date for display
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

// Format duration for display
export const formatDuration = (duration?: number): string => {
  if (!duration) return 'N/A';
  if (duration < 1) return '<1ms';
  if (duration < 1000) return `${Math.round(duration)}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
};

// Format file size for display
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
};

// Format JSON for display
export const formatJSON = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return String(data);
  }
};
