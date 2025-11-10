// 图像处理工具函数
import type { ImageProcessors, GrayData, ProcessedImage } from "../types.js";

export const imageProcessors: ImageProcessors = {
  // 灰度化
  grayscale(imageData: ImageData): GrayData {
    const data = new Uint8ClampedArray(imageData.data);
    const grayData = new Uint8ClampedArray(imageData.width * imageData.height);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      grayData[i / 4] = gray;
    }

    return {
      data: grayData,
      width: imageData.width,
      height: imageData.height,
    };
  },

  // OTSU阈值算法
  otsuThreshold(grayData: Uint8ClampedArray): number {
    const hist = new Array(256).fill(0);
    const total = grayData.length;

    // 计算直方图
    for (let i = 0; i < total; i++) {
      hist[grayData[i]]++;
    }

    // 计算OTSU阈值
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * hist[i];
    }

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;

    for (let i = 0; i < 256; i++) {
      wB += hist[i];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;

      sumB += i * hist[i];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const variance = wB * wF * (mB - mF) * (mB - mF);

      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = i;
      }
    }

    return threshold;
  },

  // 自适应阈值
  adaptiveThreshold(
    grayData: Uint8ClampedArray,
    width: number,
    height: number,
    blockSize: number = 15,
    C: number = 10
  ): Uint8ClampedArray {
    if (width * height < 50000) {
      // 小图像使用原始方法
      const result = new Uint8ClampedArray(grayData.length);
      const halfBlock = Math.floor(blockSize / 2);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sum = 0;
          let count = 0;

          const yStart = Math.max(0, y - halfBlock);
          const yEnd = Math.min(height, y + halfBlock + 1);
          const xStart = Math.max(0, x - halfBlock);
          const xEnd = Math.min(width, x + halfBlock + 1);

          for (let ny = yStart; ny < yEnd; ny++) {
            for (let nx = xStart; nx < xEnd; nx++) {
              sum += grayData[ny * width + nx];
              count++;
            }
          }

          const mean = sum / count;
          const idx = y * width + x;
          result[idx] = grayData[idx] > mean - C ? 255 : 0;
        }
      }

      return result;
    } else {
      // 大图像使用简化的块处理
      const result = new Uint8ClampedArray(grayData.length);
      const block = blockSize;

      for (let by = 0; by < height; by += block) {
        for (let bx = 0; bx < width; bx += block) {
          let sum = 0;
          let count = 0;

          const yEnd = Math.min(height, by + block);
          const xEnd = Math.min(width, bx + block);

          for (let y = by; y < yEnd; y++) {
            for (let x = bx; x < xEnd; x++) {
              sum += grayData[y * width + x];
              count++;
            }
          }

          const mean = sum / count;
          const threshold = mean - C;

          for (let y = by; y < yEnd; y++) {
            for (let x = bx; x < xEnd; x++) {
              const idx = y * width + x;
              result[idx] = grayData[idx] > threshold ? 255 : 0;
            }
          }
        }
      }

      return result;
    }
  },

  // 图像锐化
  sharpen(
    grayData: Uint8ClampedArray,
    width: number,
    height: number
  ): Uint8ClampedArray {
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const result = new Uint8ClampedArray(grayData.length);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kIdx = (ky + 1) * 3 + (kx + 1);
            sum += grayData[idx] * kernel[kIdx];
          }
        }
        result[y * width + x] = Math.min(255, Math.max(0, sum));
      }
    }

    // 复制边界
    for (let y = 0; y < height; y++) {
      result[y * width] = grayData[y * width];
      result[y * width + width - 1] = grayData[y * width + width - 1];
    }
    for (let x = 0; x < width; x++) {
      result[x] = grayData[x];
      result[(height - 1) * width + x] = grayData[(height - 1) * width + x];
    }

    return result;
  },

  // 对比度拉伸
  contrastStretch(
    grayData: Uint8ClampedArray,
    minPercent: number = 2,
    maxPercent: number = 98
  ): Uint8ClampedArray {
    const sorted = [...grayData].sort((a, b) => a - b);
    const minVal = sorted[Math.floor((sorted.length * minPercent) / 100)];
    const maxVal = sorted[Math.floor((sorted.length * maxPercent) / 100)];
    const range = maxVal - minVal;

    if (range === 0) return grayData;

    const result = new Uint8ClampedArray(grayData.length);
    for (let i = 0; i < grayData.length; i++) {
      const stretched = ((grayData[i] - minVal) / range) * 255;
      result[i] = Math.min(255, Math.max(0, Math.round(stretched)));
    }

    return result;
  },

  // 将灰度数据转换为ImageData
  grayToImageData(
    grayData: Uint8ClampedArray,
    width: number,
    height: number
  ): ImageData {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < grayData.length; i++) {
      const gray = grayData[i];
      data[i * 4] = gray;
      data[i * 4 + 1] = gray;
      data[i * 4 + 2] = gray;
      data[i * 4 + 3] = 255;
    }
    return new ImageData(data, width, height);
  },

  // 预处理方法组合
  preprocessImage(imageData: ImageData): ProcessedImage[] {
    const { data: grayData, width, height } = this.grayscale(imageData);

    const methods: Array<() => Uint8ClampedArray> = [
      // 方法1: 对比度拉伸 + OTSU阈值（最有效）
      () => {
        const stretched = this.contrastStretch(grayData);
        const threshold = this.otsuThreshold(stretched);
        const result = new Uint8ClampedArray(stretched.length);
        for (let i = 0; i < stretched.length; i++) {
          result[i] = stretched[i] > threshold ? 255 : 0;
        }
        return result;
      },
      // 方法2: 自适应阈值
      () => this.adaptiveThreshold(grayData, width, height, 15, 10),
      // 方法3: 锐化 + OTSU阈值
      () => {
        const sharpened = this.sharpen(grayData, width, height);
        const threshold = this.otsuThreshold(sharpened);
        const result = new Uint8ClampedArray(sharpened.length);
        for (let i = 0; i < sharpened.length; i++) {
          result[i] = sharpened[i] > threshold ? 255 : 0;
        }
        return result;
      },
      // 方法4: 直接OTSU阈值
      () => {
        const threshold = this.otsuThreshold(grayData);
        const result = new Uint8ClampedArray(grayData.length);
        for (let i = 0; i < grayData.length; i++) {
          result[i] = grayData[i] > threshold ? 255 : 0;
        }
        return result;
      },
    ];

    return methods.map((method, idx) => ({
      imageData: this.grayToImageData(method(), width, height),
      methodName: `方法${idx + 1}`,
    }));
  },
};
