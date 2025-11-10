/**
 * Vue QR Code Scanner TypeScript Types
 */

import type { Ref, ComputedRef } from "vue";

export interface QRCodeLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}

export interface QRCode {
  data: string;
  format?: string;
  location?: QRCodeLocation;
  regionName?: string;
  preprocessMethod?: string;
  scale?: number;
}

export interface ProcessedImage {
  imageData: ImageData;
  methodName: string;
}

export interface GrayData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface ImageProcessors {
  grayscale(imageData: ImageData): GrayData;
  otsuThreshold(grayData: Uint8ClampedArray): number;
  adaptiveThreshold(
    grayData: Uint8ClampedArray,
    width: number,
    height: number,
    blockSize?: number,
    C?: number
  ): Uint8ClampedArray;
  sharpen(
    grayData: Uint8ClampedArray,
    width: number,
    height: number
  ): Uint8ClampedArray;
  contrastStretch(
    grayData: Uint8ClampedArray,
    minPercent?: number,
    maxPercent?: number
  ): Uint8ClampedArray;
  grayToImageData(
    grayData: Uint8ClampedArray,
    width: number,
    height: number
  ): ImageData;
  preprocessImage(imageData: ImageData): ProcessedImage[];
}

export interface QRScanner {
  cropImageRegion(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): ImageData;
  adjustCodeLocation(code: QRCode, offsetX: number, offsetY: number): QRCode;
  tryDecodeQR(imageData: ImageData): QRCode | null;
  scanRegions(
    ctx: CanvasRenderingContext2D,
    imgWidth: number,
    imgHeight: number
  ): QRCode | null;
  scanMultiScale(
    ctx: CanvasRenderingContext2D,
    canvasElement: HTMLCanvasElement,
    imgWidth: number,
    imgHeight: number
  ): QRCode | null;
}

export interface UseQRCodeScannerReturn {
  resultMessage: Ref<string>;
  isLoading: Ref<boolean>;
  qrCode: Ref<QRCode | null>;
  canvas: Ref<HTMLCanvasElement | null>;
  resultClass: ComputedRef<string>;
  parseQRFromFile: (file: File) => Promise<QRCode | null>;
  parseQRFromUrl: (url: string) => Promise<QRCode | null>;
  clearResult: () => void;
  showCanvasPreview: () => void;
  hideCanvasPreview: () => void;
}
