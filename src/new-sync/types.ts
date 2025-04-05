import {
  DefaultError,
  MutationKey,
  MutationMeta,
  MutationScope,
  MutationState,
  QueryKey,
  QueryMeta,
  QueryObserverOptions,
  QueryState,
} from "@tanstack/react-query";
// Define a simplified version of DehydratedState that both versions can work with
export interface SimpleDehydratedState {
  mutations: unknown[];
  queries: unknown[];
}

export interface SyncMessage {
  type: "dehydrated-state";
  state: DehydratedState;
  Device?: DeviceInfo; //(Expo only)
  isOnlineManagerOnline: boolean;
  deviceName: string;
  persistentDeviceId: string;
}

export interface DehydratedState {
  mutations: DehydratedMutation[];
  queries: DehydratedQuery[];
}

export interface DehydratedMutation {
  mutationId: number;
  mutationKey?: MutationKey;
  state: MutationState;
  meta?: MutationMeta;
  scope?: MutationScope;
}
export interface DehydratedQuery {
  queryHash: string;
  queryKey: QueryKey;
  state: QueryState;
  promise?: Promise<unknown>;
  meta?: QueryMeta;
  observers: ObserverState[];
}
export interface ObserverState<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> {
  queryHash: string;
  options: QueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >;
}

export interface User {
  id: string;
  deviceName: string;
  deviceId: string; // Persisted device ID
  platform?: string; // Device platform (iOS, Android, Web)
  isConnected?: boolean; // Whether the device is currently connected
  expoDeviceInfo?: DeviceInfo; // Device info from expo-device (if expo-app)
}

export enum DeviceType {
  /**
   * An unknown device type.
   */
  UNKNOWN = 0,
  /**
   * A phone device.
   */
  PHONE = 1,
  /**
   * A tablet device.
   */
  TABLET = 2,
  /**
   * A desktop device.
   */
  DESKTOP = 3,
  /**
   * A TV device.
   */
  TV = 4,
}

/**
 * Interface representing the device information constants exported by expo-device.
 */
export interface DeviceInfo {
  /**
   * `true` if the app is running on a real device and `false` if running in a simulator or emulator.
   * On web, this is always set to `true`.
   */
  isDevice: boolean;

  /**
   * The device brand. The consumer-visible brand of the product/hardware. On web, this value is always `null`.
   * Example: "Apple", "google", "xiaomi"
   */
  brand: string | null;

  /**
   * The actual device manufacturer of the product or hardware.
   * Example: "Apple", "Google", "xiaomi"
   */
  manufacturer: string | null;

  /**
   * The internal model ID of the device (iOS only).
   * Example: "iPhone7,2"
   */
  modelId: string | null;

  /**
   * The human-friendly name of the device model.
   * Example: "iPhone XS Max", "Pixel 2"
   */
  modelName: string | null;

  /**
   * The specific configuration or name of the industrial design (Android only).
   * Example: "kminilte"
   */
  designName: string | null;

  /**
   * The device's overall product name chosen by the device implementer (Android only).
   * Example: "kminiltexx"
   */
  productName: string | null;

  /**
   * The type of the device.
   */
  deviceType: DeviceType | null;

  /**
   * The device year class.
   */
  deviceYearClass: number | null;

  /**
   * The device's total memory in bytes.
   * Example: 17179869184
   */
  totalMemory: number | null;

  /**
   * A list of supported processor architecture versions.
   * Example: ['arm64 v8', 'Intel x86-64h Haswell']
   */
  supportedCpuArchitectures: string[] | null;

  /**
   * The name of the OS running on the device.
   * Example: "iOS", "Android", "Windows"
   */
  osName: string | null;

  /**
   * The human-readable OS version string.
   * Example: "12.3.1", "8.1.0"
   */
  osVersion: string | null;

  /**
   * The build ID of the OS.
   * Example: "16F203", "PSR1.180720.075"
   */
  osBuildId: string | null;

  /**
   * The internal build ID of the OS running on the device.
   * Example: "16F203", "MMB29K"
   */
  osInternalBuildId: string | null;

  /**
   * A string that uniquely identifies the build of the currently running system OS (Android only).
   * Example: "google/sdk_gphone_x86/generic_x86:9/PSR1.180720.075/5124027:user/release-keys"
   */
  osBuildFingerprint: string | null;

  /**
   * The Android SDK version of the software currently running on this hardware device (Android only).
   * Example: 19
   */
  platformApiLevel: number | null;

  /**
   * The human-readable name of the device, which may be set by the device's user.
   * Example: "Vivian's iPhone XS"
   * Note: On iOS 16+, requires entitlement to get the actual name.
   */
  deviceName: string | null;
}
