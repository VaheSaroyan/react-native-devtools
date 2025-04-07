import { app, BrowserWindow, dialog } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { startServer } from "./server";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { setupAutoUpdater } from "./auto-updater";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// For Socket.IO server
let socketServer: { io: Server; server: HttpServer } | null = null;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open DevTools only in development mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  try {
    // Start the Socket.IO server
    socketServer = startServer();
    console.log("Simple Socket.IO server started");

    // Setup auto-updater
    setupAutoUpdater();

    // Create the application window
    createWindow();
  } catch (error) {
    console.error("Failed to start application:", error);

    // Show error dialog
    dialog.showErrorBox(
      "Application Error",
      `Failed to start the application: ${error.message}\n\nThe application will now exit.`
    );

    // Exit the app with error code
    app.exit(1);
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Close server when app quits
app.on("quit", () => {
  if (socketServer && socketServer.server) {
    socketServer.server.close();
    console.log("Socket.IO server closed");
  }
});
