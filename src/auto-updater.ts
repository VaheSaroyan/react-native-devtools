import { autoUpdater, UpdateInfo, ProgressInfo } from "electron-updater";
import log from "electron-log";

// Configure logger
log.transports.file.level = "info";
autoUpdater.logger = log;

export function setupAutoUpdater() {
  // Check for updates on startup
  autoUpdater.checkForUpdatesAndNotify();

  // Set up auto updater events
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update...");
  });

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    log.info("Update available:", info);
  });

  autoUpdater.on("update-not-available", (info: UpdateInfo) => {
    log.info("Update not available:", info);
  });

  autoUpdater.on("error", (err: Error) => {
    log.error("Error in auto-updater:", err);
  });

  autoUpdater.on("download-progress", (progressObj: ProgressInfo) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
    logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
    logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
    log.info(logMessage);
  });

  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    log.info("Update downloaded:", info);
    // Install the update when the app is quit
    // Alternatively, you could prompt the user here
  });

  // Check for updates periodically
  const CHECK_INTERVAL = 1000 * 60 * 60; // Check every hour
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, CHECK_INTERVAL);
}
