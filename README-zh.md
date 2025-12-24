# vue-qrcode-scanner

[English](./README.md) | [中文](./README-zh.md)

一个强大的 Vue 3 二维码识别工具，支持高级图像处理和多区域/多尺度扫描。

[![npm version](https://img.shields.io/npm/v/vue-qrcode-scanner.svg)](https://www.npmjs.com/package/vue-qrcode-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- ✅ **Vue 3 Composable** - 使用 Composition API，易于集成
- ✅ **高级图像处理** - OTSU 阈值、自适应阈值、锐化、对比度拉伸
- ✅ **多区域扫描** - 优先扫描常见位置（右下角），使用滑动窗口提高精度
- ✅ **多尺度扫描** - 适配不同尺寸的二维码
- ✅ **自动定位** - 自动在图片中定位二维码位置
- ✅ **可视化** - 在图片上标记二维码边界
- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **零依赖** - 除了 Vue 3，无其他依赖

## 📦 安装

```bash
npm install vue-qrcode-scanner
# 或
yarn add vue-qrcode-scanner
# 或
pnpm add vue-qrcode-scanner
```

**注意**：此包需要 `jsQR` 库来识别二维码。请确保已安装：

```bash
npm install jsqr
# 或
yarn add jsqr
# 或
pnpm add jsqr
```

## 🚀 快速开始

### 基础用法（使用 Composable）

```vue
<template>
  <div>
    <input type="file" @change="handleFileSelect" accept="image/*" />
    <button @click="parseQRCode" :disabled="isLoading">
      {{ isLoading ? "解析中..." : "解析二维码" }}
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

// 使用 QR Code Scanner Composable
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

### 从 URL 解析

```javascript
import { useQRCodeScanner } from "vue-qrcode-scanner/composables";

const { parseQRFromUrl } = useQRCodeScanner();

// 从 URL 解析二维码
const code = await parseQRFromUrl("https://example.com/qrcode.png");
if (code) {
  console.log("二维码内容:", code.data);
}
```

### 高级用法（直接使用工具函数）

```javascript
import { imageProcessors, qrScanner } from "vue-qrcode-scanner";

// 使用图像处理工具
const imageData = ctx.getImageData(0, 0, width, height);
const processed = imageProcessors.preprocessImage(imageData);

// 使用二维码扫描器
const code = qrScanner.scanRegions(ctx, width, height);
if (code) {
  console.log("二维码内容:", code.data);
  console.log("位置:", code.location);
}
```

## 📖 API 文档

### Composable: `useQRCodeScanner()`

返回一个包含以下属性和方法的对象：

#### 响应式状态

- `resultMessage: Ref<string>` - 结果消息
- `isLoading: Ref<boolean>` - 加载状态
- `qrCode: Ref<QRCode | null>` - 识别到的二维码数据
- `canvas: Ref<HTMLCanvasElement | null>` - Canvas 元素引用
- `resultClass: ComputedRef<string>` - 结果样式类（'success' | 'error' | 'info'）

#### 方法

- `parseQRFromFile(file: File): Promise<QRCode | null>` - 从文件解析二维码
- `parseQRFromUrl(url: string): Promise<QRCode | null>` - 从 URL 解析二维码
- `clearResult(): void` - 清除结果
- `showCanvasPreview(): void` - 显示 Canvas 预览
- `hideCanvasPreview(): void` - 隐藏 Canvas 预览

### 工具函数: `imageProcessors`

图像处理工具函数集合：

- `grayscale(imageData: ImageData): GrayData` - 灰度化
- `otsuThreshold(grayData: Uint8ClampedArray): number` - OTSU 阈值算法
- `adaptiveThreshold(grayData, width, height, blockSize?, C?): Uint8ClampedArray` - 自适应阈值
- `sharpen(grayData, width, height): Uint8ClampedArray` - 图像锐化
- `contrastStretch(grayData, minPercent?, maxPercent?): Uint8ClampedArray` - 对比度拉伸
- `preprocessImage(imageData: ImageData): ProcessedImage[]` - 预处理方法组合

### 工具函数: `qrScanner`

二维码扫描工具函数集合：

- `tryDecodeQR(imageData: ImageData): QRCode | null` - 尝试识别二维码
- `scanRegions(ctx, imgWidth, imgHeight): QRCode | null` - 多区域扫描
- `scanMultiScale(ctx, canvasElement, imgWidth, imgHeight): QRCode | null` - 多尺度扫描
- `adjustCodeLocation(code, offsetX, offsetY): QRCode` - 调整坐标
- `cropImageRegion(ctx, x, y, width, height): ImageData` - 裁剪图片区域

### 类型定义

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

## 🎯 使用场景

- 📱 移动端二维码识别
- 🖼️ 图片中的二维码识别
- 📄 文档中的二维码识别
- 🎨 复杂背景下的二维码识别
- 🔍 小尺寸二维码识别

## 🔧 原理说明

### 图像预处理

1. **灰度化** - 将彩色图像转换为灰度图
2. **OTSU 阈值** - 自动选择最佳二值化阈值
3. **自适应阈值** - 根据局部区域自适应阈值
4. **图像锐化** - 增强边缘，提高识别率
5. **对比度拉伸** - 提升对比度

### 扫描策略

1. **多区域扫描** - 优先扫描常见位置（右下角），使用滑动窗口
2. **多尺度扫描** - 在不同缩放级别下尝试识别
3. **多种预处理方法** - 自动尝试多种预处理方法组合

## 📁 项目结构

```
vue-qrcode-scanner/
├── src/
│   ├── index.js              # 主入口文件
│   ├── index.d.ts            # TypeScript 类型定义
│   ├── utils/
│   │   ├── imageProcessors.js  # 图像处理工具
│   │   ├── qrScanner.js        # 二维码扫描逻辑
│   │   └── index.js            # 工具函数导出
│   └── composables/
│       ├── useQRCodeScanner.js # Vue Composable
│       └── index.js            # Composable 导出
├── examples/                 # 示例代码
├── package.json
├── LICENSE
└── README.md
```

## 🌐 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari
- 需要支持 ES6 Modules 和 Canvas API

## ⚠️ 注意事项

1. **jsQR 依赖** - 需要安装 `jsqr` 包
2. **Canvas API** - 需要浏览器支持 Canvas API
3. **跨域问题** - 网络图片可能存在跨域问题，需要服务器支持 CORS
4. **性能** - 大图片处理可能较慢，建议使用适当尺寸的图片

## 📝 示例

查看 `examples/` 目录获取更多示例：

- `basic-usage.vue` - 基础用法示例
- `advanced-usage.js` - 高级用法示例

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [jsQR](https://github.com/cozmo/jsQR) - QR code reading library
- [Vue 3](https://vuejs.org/) - Progressive JavaScript Framework
