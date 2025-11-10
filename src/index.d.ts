/**
 * Vue QR Code Scanner TypeScript Definitions
 * This file provides type definitions for external users
 */

// Re-export all types
export type {
  QRCode,
  QRCodeLocation,
  ProcessedImage,
  GrayData,
  ImageProcessors,
  QRScanner,
  UseQRCodeScannerReturn,
} from "./types.js";

// Declare runtime exports for type checking
export declare const imageProcessors: import("./types.js").ImageProcessors;
export declare const qrScanner: import("./types.js").QRScanner;
export declare function useQRCodeScanner(): import("./types.js").UseQRCodeScannerReturn;
