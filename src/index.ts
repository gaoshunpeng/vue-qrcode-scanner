/**
 * Vue QR Code Scanner
 * A powerful Vue 3 QR code scanner with advanced image processing
 */

// 导出类型
export type {
  QRCode,
  QRCodeLocation,
  ProcessedImage,
  GrayData,
  ImageProcessors,
  QRScanner,
  UseQRCodeScannerReturn,
} from "./types.js";

// 导出工具函数
export { imageProcessors } from "./utils/imageProcessors.js";
export { qrScanner } from "./utils/qrScanner.js";

// 导出 Composables
export { useQRCodeScanner } from "./composables/useQRCodeScanner.js";

// 默认导出
export default {
  imageProcessors: () => import("./utils/imageProcessors.js"),
  qrScanner: () => import("./utils/qrScanner.js"),
  useQRCodeScanner: () => import("./composables/useQRCodeScanner.js"),
};
