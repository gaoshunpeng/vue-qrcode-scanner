// Vue Composable for QR Code Scanner
import { ref, computed, type Ref, type ComputedRef } from "vue";
import { qrScanner } from "../utils/qrScanner.js";
import type {
  QRCode,
  QRCodeLocation,
  UseQRCodeScannerReturn,
} from "../types.js";

export function useQRCodeScanner(): UseQRCodeScannerReturn {
  // 状态
  const resultMessage: Ref<string> = ref(
    "请选择一张包含二维码的图片或输入网络图片URL"
  );
  const isLoading: Ref<boolean> = ref(false);
  const qrCode: Ref<QRCode | null> = ref(null);
  const canvas: Ref<HTMLCanvasElement | null> = ref(null);

  // 计算属性
  const resultClass: ComputedRef<string> = computed(() => {
    if (resultMessage.value.includes("解析成功")) return "success";
    if (
      resultMessage.value.includes("解析出错") ||
      resultMessage.value.includes("失败")
    )
      return "error";
    return "info";
  });

  // 绘制二维码位置框
  const drawQRCodeLocation = (
    ctx: CanvasRenderingContext2D,
    code: QRCode
  ): void => {
    if (!code.location) return;

    ctx.beginPath();
    ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
    ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
    ctx.lineTo(
      code.location.bottomRightCorner.x,
      code.location.bottomRightCorner.y
    );
    ctx.lineTo(
      code.location.bottomLeftCorner.x,
      code.location.bottomLeftCorner.y
    );
    ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00ff00";
    ctx.stroke();

    // 标记角点
    const drawCornerPoint = (
      point: { x: number; y: number },
      color: string
    ): void => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fill();
    };

    drawCornerPoint(code.location.topLeftCorner, "#ff0000");
    drawCornerPoint(code.location.topRightCorner, "#0000ff");
    drawCornerPoint(code.location.bottomLeftCorner, "#ffff00");
    drawCornerPoint(code.location.bottomRightCorner, "#ff00ff");
  };

  // 显示canvas预览
  const showCanvasPreview = (): void => {
    if (canvas.value) {
      canvas.value.style.display = "block";
      canvas.value.style.maxWidth = "100%";
      canvas.value.style.margin = "20px auto";
    }
  };

  // 隐藏canvas
  const hideCanvasPreview = (): void => {
    if (canvas.value) {
      canvas.value.style.display = "none";
    }
  };

  // 从文件解析二维码
  const parseQRFromFile = async (file: File): Promise<QRCode | null> => {
    if (!file) {
      resultMessage.value = "请先选择一个图片文件";
      return null;
    }

    isLoading.value = true;
    resultMessage.value = "正在解析二维码，请稍候...";

    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        try {
          if (!canvas.value) {
            reject(new Error("Canvas未初始化"));
            return;
          }

          canvas.value.width = img.width;
          canvas.value.height = img.height;

          const ctx = canvas.value.getContext("2d");
          if (!ctx) {
            reject(new Error("无法获取 Canvas 上下文"));
            return;
          }

          ctx.drawImage(img, 0, 0, img.width, img.height);

          let code: QRCode | null = null;
          let method = "";

          // 方法1：多区域扫描
          resultMessage.value = "正在扫描图片区域...";
          code = qrScanner.scanRegions(ctx, img.width, img.height);
          if (code) {
            method = `多区域扫描（${code.regionName || "未知区域"}）`;
          }

          // 方法2：多尺度扫描
          if (!code) {
            resultMessage.value = "正在尝试多尺度扫描...";
            code = qrScanner.scanMultiScale(
              ctx,
              canvas.value,
              img.width,
              img.height
            );
            if (code) {
              method = `多尺度扫描（缩放比例: ${code.scale || 1}）`;
            }
          }

          if (code) {
            drawQRCodeLocation(ctx, code);
            showCanvasPreview();

            qrCode.value = code;
            resultMessage.value = `
              <h3>解析成功!</h3>
              <p><strong>识别方法:</strong> ${method}${
              code.preprocessMethod ? ` (${code.preprocessMethod})` : ""
            }</p>
              <p><strong>内容:</strong> ${code.data}</p>
              <p><strong>格式:</strong> ${code.format || "QR Code"}</p>
              <p><strong>位置:</strong> 已在图片上标记二维码边界</p>
            `;
            resolve(code);
          } else {
            hideCanvasPreview();
            resultMessage.value =
              "未检测到二维码。已尝试区域扫描和多尺度扫描。";
            resolve(null);
          }
        } catch (error) {
          hideCanvasPreview();
          const errorMessage =
            error instanceof Error ? error.message : "未知错误";
          resultMessage.value = `解析出错: ${errorMessage}`;
          reject(error);
        } finally {
          isLoading.value = false;
          URL.revokeObjectURL(objectUrl);
        }
      };

      img.onerror = () => {
        hideCanvasPreview();
        resultMessage.value = "图片加载失败";
        isLoading.value = false;
        URL.revokeObjectURL(objectUrl);
        reject(new Error("图片加载失败"));
      };

      img.src = objectUrl;
    });
  };

  // 从URL解析二维码
  const parseQRFromUrl = async (url: string): Promise<QRCode | null> => {
    if (!url) {
      resultMessage.value = "请输入图片URL";
      return null;
    }

    isLoading.value = true;
    resultMessage.value = "正在加载图片...";
    showCanvasPreview();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = async () => {
        try {
          if (!canvas.value) {
            reject(new Error("Canvas未初始化"));
            return;
          }

          canvas.value.width = img.width;
          canvas.value.height = img.height;

          const ctx = canvas.value.getContext("2d");
          if (!ctx) {
            reject(new Error("无法获取 Canvas 上下文"));
            return;
          }

          ctx.drawImage(img, 0, 0, img.width, img.height);

          let code: QRCode | null = null;
          let method = "";

          // 方法1：多区域扫描
          resultMessage.value = "正在扫描图片区域...";
          code = qrScanner.scanRegions(ctx, img.width, img.height);
          if (code) {
            method = `多区域扫描（${code.regionName || "未知区域"}）`;
          }

          // 方法2：多尺度扫描
          if (!code) {
            resultMessage.value = "正在尝试多尺度扫描...";
            code = qrScanner.scanMultiScale(
              ctx,
              canvas.value,
              img.width,
              img.height
            );
            if (code) {
              method = `多尺度扫描（缩放比例: ${code.scale || 1}）`;
            }
          }

          if (code) {
            drawQRCodeLocation(ctx, code);

            qrCode.value = code;
            resultMessage.value = `
              <h3>解析成功!</h3>
              <p><strong>识别方法:</strong> ${method}${
              code.preprocessMethod ? ` (${code.preprocessMethod})` : ""
            }</p>
              <p><strong>内容:</strong> ${code.data}</p>
              <p><strong>格式:</strong> ${code.format || "QR Code"}</p>
              <p><strong>位置:</strong> 已在图片上标记二维码边界</p>
            `;
            resolve(code);
          } else {
            resultMessage.value =
              "未检测到二维码。已尝试区域扫描和多尺度扫描。";
            resolve(null);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "未知错误";
          resultMessage.value = `解析出错: ${errorMessage}`;
          reject(error);
        } finally {
          isLoading.value = false;
        }
      };

      img.onerror = () => {
        resultMessage.value =
          "图片加载失败，请检查URL是否正确或是否存在跨域问题";
        isLoading.value = false;
        reject(new Error("图片加载失败"));
      };

      img.src = url;
    });
  };

  // 清除结果
  const clearResult = (): void => {
    qrCode.value = null;
    resultMessage.value = "请选择一张包含二维码的图片或输入网络图片URL";
    hideCanvasPreview();
  };

  return {
    // 状态
    resultMessage,
    isLoading,
    qrCode,
    canvas,
    resultClass,

    // 方法
    parseQRFromFile,
    parseQRFromUrl,
    clearResult,
    showCanvasPreview,
    hideCanvasPreview,
  };
}
