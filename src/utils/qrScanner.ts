// 二维码扫描核心逻辑
import { imageProcessors } from "./imageProcessors.js";
import type { QRScanner, QRCode, QRCodeLocation } from "../types.js";

// 扩展 jsQR 的类型定义
declare global {
  interface Window {
    jsQR?: (
      data: Uint8ClampedArray,
      width: number,
      height: number,
      options?: {
        inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth";
      }
    ) => QRCode | null;
  }
}

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
}

export const qrScanner: QRScanner = {
  // 裁剪图片区域
  cropImageRegion(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): ImageData {
    return ctx.getImageData(x, y, width, height);
  },

  // 调整二维码坐标到原图坐标系
  adjustCodeLocation(code: QRCode, offsetX: number, offsetY: number): QRCode {
    if (!code.location) return code;

    code.location.topLeftCorner.x += offsetX;
    code.location.topLeftCorner.y += offsetY;
    code.location.topRightCorner.x += offsetX;
    code.location.topRightCorner.y += offsetY;
    code.location.bottomLeftCorner.x += offsetX;
    code.location.bottomLeftCorner.y += offsetY;
    code.location.bottomRightCorner.x += offsetX;
    code.location.bottomRightCorner.y += offsetY;
    return code;
  },

  // 识别二维码（尝试多种预处理方法）
  tryDecodeQR(imageData: ImageData): QRCode | null {
    const processedResults = imageProcessors.preprocessImage(imageData);
    // jsQR 通过全局 script 标签加载
    const jsQR =
      (typeof window !== "undefined" && window.jsQR) ||
      (typeof globalThis !== "undefined" && (globalThis as any).jsQR);
    if (!jsQR) {
      console.error("jsQR 未加载");
      return null;
    }
    for (const processed of processedResults) {
      const code = jsQR(
        processed.imageData.data,
        processed.imageData.width,
        processed.imageData.height,
        { inversionAttempts: "attemptBoth" }
      );
      if (code) {
        code.preprocessMethod = processed.methodName;
        return code;
      }
    }
    return null;
  },

  // 多区域扫描：优先扫描常见位置
  scanRegions(
    ctx: CanvasRenderingContext2D,
    imgWidth: number,
    imgHeight: number
  ): QRCode | null {
    // 首先尝试右下角的精细滑动窗口扫描
    const windowSize = 0.25;
    const step = 0.15;
    const windowWidth = Math.floor(imgWidth * windowSize);
    const windowHeight = Math.floor(imgHeight * windowSize);
    const stepX = Math.floor(imgWidth * step);
    const stepY = Math.floor(imgHeight * step);
    const startX = Math.floor(imgWidth * 0.5);
    const startY = Math.floor(imgHeight * 0.5);

    // 从右下角开始滑动窗口扫描
    for (let y = imgHeight - windowHeight; y >= startY; y -= stepY) {
      for (let x = imgWidth - windowWidth; x >= startX; x -= stepX) {
        const width = Math.min(windowWidth, imgWidth - x);
        const height = Math.min(windowHeight, imgHeight - y);
        if (width <= 0 || height <= 0) continue;

        const imageData = this.cropImageRegion(ctx, x, y, width, height);
        const code = this.tryDecodeQR(imageData);
        if (code) {
          this.adjustCodeLocation(code, x, y);
          code.regionName = "右下角滑动窗口";
          return code;
        }
      }
    }

    // 扫描主要区域
    const regions: Region[] = [
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5, name: "右下角" },
      { x: 0.5, y: 0, w: 0.5, h: 0.5, name: "右上角" },
      { x: 0, y: 0.5, w: 0.5, h: 0.5, name: "左下角" },
      { x: 0, y: 0, w: 0.5, h: 0.5, name: "左上角" },
      { x: 0.25, y: 0.25, w: 0.5, h: 0.5, name: "中心" },
      { x: 0, y: 0, w: 1, h: 1, name: "整张图片" },
    ];

    for (const region of regions) {
      const x = Math.floor(region.x * imgWidth);
      const y = Math.floor(region.y * imgHeight);
      const width = Math.floor(region.w * imgWidth);
      const height = Math.floor(region.h * imgHeight);

      const imageData = this.cropImageRegion(ctx, x, y, width, height);
      const code = this.tryDecodeQR(imageData);

      if (code) {
        this.adjustCodeLocation(code, x, y);
        code.regionName = region.name;
        return code;
      }
    }

    return null;
  },

  // 多尺度扫描：在不同缩放级别下尝试识别
  scanMultiScale(
    ctx: CanvasRenderingContext2D,
    canvasElement: HTMLCanvasElement,
    imgWidth: number,
    imgHeight: number
  ): QRCode | null {
    const scales = [1.5, 2.0, 0.75, 0.5];

    for (const scale of scales) {
      const scaledWidth = Math.floor(imgWidth * scale);
      const scaledHeight = Math.floor(imgHeight * scale);

      if (scaledWidth < 100 || scaledHeight < 100) continue;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) continue;

      tempCtx.drawImage(canvasElement, 0, 0, scaledWidth, scaledHeight);

      const imageData = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight);
      const code = this.tryDecodeQR(imageData);

      if (code && code.location) {
        // 调整坐标回原图尺寸
        const adjustScale = (point: { x: number; y: number }) => {
          point.x /= scale;
          point.y /= scale;
        };
        adjustScale(code.location.topLeftCorner);
        adjustScale(code.location.topRightCorner);
        adjustScale(code.location.bottomLeftCorner);
        adjustScale(code.location.bottomRightCorner);
        code.scale = scale;
        return code;
      }
    }

    return null;
  },
};
