declare module "electron-squirrel-startup" {
  const value: boolean;
  export default value;
}

// Vite environment variables
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;
