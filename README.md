# vue-qrcode-scanner

[English](./README.md) | [中文](./README-zh.md)

A powerful Vue 3 QR code recognition tool with advanced image processing and multi-region/multi-scale scanning support.

[![npm version](https://img.shields.io/npm/v/vue-qrcode-scanner.svg)](https://www.npmjs.com/package/vue-qrcode-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- ✅ **Vue 3 Composable** - Uses Composition API, easy to integrate
- ✅ **Advanced Image Processing** - OTSU threshold, adaptive threshold, sharpening, contrast stretching
- ✅ **Multi-Region Scanning** - Prioritizes scanning common locations (bottom-right corner), uses sliding window for improved accuracy
- ✅ **Multi-Scale Scanning** - Adapts to QR codes of different sizes
- ✅ **Auto Positioning** - Automatically locates QR code position in images
- ✅ **Visualization** - Marks QR code boundaries on images
- ✅ **TypeScript Support** - Complete type definitions
- ✅ **Zero Dependencies** - No dependencies except Vue 3

## 📦 Installation

```bash
npm install vue-qrcode-scanner
# or
yarn add vue-qrcode-scanner
# or
pnpm add vue-qrcode-scanner
```

**Note**: This package requires the `jsQR` library for QR code recognition. Please ensure it is installed:

```bash
npm install jsqr
# or
yarn add jsqr
# or
pnpm add jsqr
```

## 🚀 Quick Start

### Basic Usage (Using Composable)

```vue
<template>
  <div>
    <input type="file" @change="handleFileSelect" accept="image/*" />
    <button @click="parseQRCode" :disabled="isLoading">
      {{ isLoading ? "Parsing..." : "Parse QR Code" }}
    </button>

    <canvas ref="canvas" style="display: none"></canvas>

    <div v-if="resultMessage" :class="resultClass">
      <div v-html="resultMessage"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQRCodeScanner } from "vue-qrcode-scanner/composables";

const fileInput = ref(null);
const selectedFile = ref(null);

// Use QR Code Scanner Composable
const {
  resultMessage,
  isLoading,
  qrCode,
  canvas,
  resultClass,
  parseQRFromFile,
  clearResult,
} = useQRCodeScanner();

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0];
};

const parseQRCode = async () => {
  if (selectedFile.value) {
    await parseQRFromFile(selectedFile.value);
  }
};
</script>
```

### Parse from URL

```javascript
import { useQRCodeScanner } from "vue-qrcode-scanner/composables";

const { parseQRFromUrl } = useQRCodeScanner();

// Parse QR code from URL
const code = await parseQRFromUrl("https://example.com/qrcode.png");
if (code) {
  console.log("QR Code content:", code.data);
}
```

### Advanced Usage (Direct Use of Utility Functions)

```javascript
import { imageProcessors, qrScanner } from "vue-qrcode-scanner";

// Use image processing utilities
const imageData = ctx.getImageData(0, 0, width, height);
const processed = imageProcessors.preprocessImage(imageData);

// Use QR code scanner
const code = qrScanner.scanRegions(ctx, width, height);
if (code) {
  console.log("QR Code content:", code.data);
  console.log("Location:", code.location);
}
```

## 📖 API Documentation

### Composable: `useQRCodeScanner()`

Returns an object containing the following properties and methods:

#### Reactive State

- `resultMessage: Ref<string>` - Result message
- `isLoading: Ref<boolean>` - Loading state
- `qrCode: Ref<QRCode | null>` - Recognized QR code data
- `canvas: Ref<HTMLCanvasElement | null>` - Canvas element reference
- `resultClass: ComputedRef<string>` - Result style class ('success' | 'error' | 'info')

#### Methods

- `parseQRFromFile(file: File): Promise<QRCode | null>` - Parse QR code from file
- `parseQRFromUrl(url: string): Promise<QRCode | null>` - Parse QR code from URL
- `clearResult(): void` - Clear result
- `showCanvasPreview(): void` - Show canvas preview
- `hideCanvasPreview(): void` - Hide canvas preview

### Utility Functions: `imageProcessors`

Image processing utility function collection:

- `grayscale(imageData: ImageData): GrayData` - Grayscale conversion
- `otsuThreshold(grayData: Uint8ClampedArray): number` - OTSU threshold algorithm
- `adaptiveThreshold(grayData, width, height, blockSize?, C?): Uint8ClampedArray` - Adaptive threshold
- `sharpen(grayData, width, height): Uint8ClampedArray` - Image sharpening
- `contrastStretch(grayData, minPercent?, maxPercent?): Uint8ClampedArray` - Contrast stretching
- `preprocessImage(imageData: ImageData): ProcessedImage[]` - Preprocessing method combination

### Utility Functions: `qrScanner`

QR code scanning utility function collection:

- `tryDecodeQR(imageData: ImageData): QRCode | null` - Try to decode QR code
- `scanRegions(ctx, imgWidth, imgHeight): QRCode | null` - Multi-region scanning
- `scanMultiScale(ctx, canvasElement, imgWidth, imgHeight): QRCode | null` - Multi-scale scanning
- `adjustCodeLocation(code, offsetX, offsetY): QRCode` - Adjust coordinates
- `cropImageRegion(ctx, x, y, width, height): ImageData` - Crop image region

### Type Definitions

```typescript
interface QRCode {
  data: string;
  format?: string;
  location?: QRCodeLocation;
  regionName?: string;
  preprocessMethod?: string;
  scale?: number;
}

interface QRCodeLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}
```

## 🎯 Use Cases

- 📱 Mobile QR code recognition
- 🖼️ QR code recognition in images
- 📄 QR code recognition in documents
- 🎨 QR code recognition in complex backgrounds
- 🔍 Small-size QR code recognition

## 🔧 Technical Details

### Image Preprocessing

1. **Grayscale Conversion** - Convert color images to grayscale
2. **OTSU Threshold** - Automatically select optimal binarization threshold
3. **Adaptive Threshold** - Adaptive threshold based on local regions
4. **Image Sharpening** - Enhance edges to improve recognition rate
5. **Contrast Stretching** - Enhance contrast

### Scanning Strategy

1. **Multi-Region Scanning** - Prioritize scanning common locations (bottom-right corner), use sliding window
2. **Multi-Scale Scanning** - Try recognition at different zoom levels
3. **Multiple Preprocessing Methods** - Automatically try various preprocessing method combinations

## 📁 Project Structure

```
vue-qrcode-scanner/
├── src/
│   ├── index.js              # Main entry file
│   ├── index.d.ts            # TypeScript type definitions
│   ├── utils/
│   │   ├── imageProcessors.js  # Image processing utilities
│   │   ├── qrScanner.js        # QR code scanning logic
│   │   └── index.js            # Utility function exports
│   └── composables/
│       ├── useQRCodeScanner.js # Vue Composable
│       └── index.js            # Composable exports
├── examples/                 # Example code
├── package.json
├── LICENSE
└── README.md
```

## 🌐 Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Requires ES6 Modules and Canvas API support

## ⚠️ Notes

1. **jsQR Dependency** - Requires installation of the `jsqr` package
2. **Canvas API** - Requires browser support for Canvas API
3. **CORS Issues** - Network images may have CORS issues, server needs to support CORS
4. **Performance** - Large image processing may be slow, recommend using appropriately sized images

## 📝 Examples

Check the `examples/` directory for more examples:

- `basic-usage.vue` - Basic usage example
- `advanced-usage.js` - Advanced usage example

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

## 🔗 Related Links

- [jsQR](https://github.com/cozmo/jsQR) - QR code reading library
- [Vue 3](https://vuejs.org/) - Progressive JavaScript Framework
