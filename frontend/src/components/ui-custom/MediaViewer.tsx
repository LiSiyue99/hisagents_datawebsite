'use client';

import React, { useEffect, useRef, useState, Component, ErrorInfo } from 'react';
import dynamic from 'next/dynamic';
import UTIF from 'utif';

// 动态导入依赖浏览器 API 的组件
const Viewer = dynamic(() => import('react-viewer'), {
  ssr: false,
});

const PDFViewer = dynamic(() => import('@/components/ui-custom/PDFViewer'), {
  ssr: false,
  loading: () => <div className="text-gray-500 py-8 text-center">正在加载 PDF 预览组件...</div>
});

interface MediaViewerProps {
  fileUrl: string;
  fileName: string;
}

type FetchError = {
  message: string;
  status?: number;
  statusText?: string;
}

// 错误边界组件
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到错误报告服务
    this.logError(error, errorInfo);
  }

  logError = (error: Error, errorInfo?: ErrorInfo) => {
    // 在生产环境中使用适当的错误报告服务
    if (process.env.NODE_ENV === 'production') {
      // TODO: 集成错误报告服务
      console.error({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
      });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 py-8 text-center">
          <h2 className="text-lg font-semibold mb-2">组件加载失败</h2>
          <p className="text-sm text-gray-600 mb-4">
            {this.state.error?.message || '发生未知错误'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 声明 decode-tiff 模块
declare module 'decode-tiff' {
  export function decode(buffer: ArrayBuffer): {
    width: number;
    height: number;
    data: Uint8Array;
  };
}

/**
 * MediaViewer 组件：支持多种主流媒体文件的前端渲染
 * 支持图片（含tif/tiff/heic/heif）、音视频、PDF、docx、xlsx
 * 不支持的类型友好提示并提供下载
 */
const MediaViewer: React.FC<MediaViewerProps> = ({ fileUrl, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError | null>(null);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // 安全的 fetch 函数
  const safeFetch = async (url: string) => {
    try {
      // 如果是相对路径，直接获取
      if (url.startsWith('/')) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      }

      // 对于外部 URL，首先尝试直接获取
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': '*/*',
          },
          next: { revalidate: 0 }, // 禁用缓存
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      } catch (directError) {
        console.warn('Direct fetch failed, trying proxy:', directError);
        
        // 如果直接获取失败，尝试通过代理
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl, {
          next: { revalidate: 0 }, // 禁用缓存
        });
        
        if (!proxyResponse.ok) {
          throw new Error(`Proxy HTTP error! status: ${proxyResponse.status}`);
        }
        return proxyResponse;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      throw new Error(
        err instanceof Error 
          ? `文件获取失败: ${err.message}` 
          : '文件获取失败，请检查网络连接'
      );
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadFile = async () => {
      if (!fileUrl) {
        setError({ message: '文件地址无效' });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setContent(null);

        // 1. 普通图片类型
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
          setContent(
            <div>
              <img 
                src={fileUrl} 
                alt={fileName} 
                className="max-w-full max-h-96 object-contain rounded-lg cursor-pointer"
                onClick={() => setViewerVisible(true)}
                onError={() => {
                  if (mounted) {
                    setError({ message: '图片加载失败' });
                  }
                }}
              />
              <Viewer
                visible={viewerVisible}
                onClose={() => setViewerVisible(false)}
                images={[{ src: fileUrl, alt: fileName }]}
                zoomable
                rotatable
                scalable
              />
            </div>
          );
          return;
        }

        // 2. tif/tiff 图片
        if (["tif", "tiff"].includes(ext)) {
          const response = await safeFetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          
          // 使用 UTIF 解码 TIFF 数据
          const ifds = UTIF.decode(arrayBuffer);
          UTIF.decodeImage(arrayBuffer, ifds[0]); // 解码第一帧
          const rgba = UTIF.toRGBA8(ifds[0]); // 转换为 RGBA 格式
          
          // 创建 canvas 并渲染
          const canvas = document.createElement('canvas');
          canvas.width = ifds[0].width;
          canvas.height = ifds[0].height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            const imageData = new ImageData(
              new Uint8ClampedArray(rgba.buffer),
              ifds[0].width,
              ifds[0].height
            );
            ctx.putImageData(imageData, 0, 0);
          }
          
          if (mounted) {
            setContent(
              <div className="max-w-full max-h-96 overflow-auto">
                <div 
                  ref={el => {
                    if (el) {
                      el.innerHTML = '';
                      el.appendChild(canvas);
                    }
                  }}
                  className="cursor-pointer"
                  onClick={() => setViewerVisible(true)}
                />
                <Viewer
                  visible={viewerVisible}
                  onClose={() => setViewerVisible(false)}
                  images={[{ src: canvas.toDataURL(), alt: fileName }]}
                  zoomable
                  rotatable
                  scalable
                />
              </div>
            );
          }
          return;
        }

        // 3. heic/heif 图片
        if (["heic", "heif"].includes(ext)) {
          const heic2any = (await import('heic2any')).default;
          const response = await safeFetch(fileUrl);
          const blob = await response.blob();
          const result = await heic2any({ blob, toType: "image/jpeg" });
          
          let url = '';
          if (Array.isArray(result)) {
            url = URL.createObjectURL(result[0]);
          } else {
            url = URL.createObjectURL(result);
          }
          
          if (mounted) {
            setContent(
              <div>
                <img 
                  src={url} 
                  alt={fileName} 
                  className="max-w-full max-h-96 object-contain rounded-lg cursor-pointer"
                  onClick={() => setViewerVisible(true)}
                />
                <Viewer
                  visible={viewerVisible}
                  onClose={() => setViewerVisible(false)}
                  images={[{ src: url, alt: fileName }]}
                  zoomable
                  rotatable
                  scalable
                />
              </div>
            );
          }
          return;
        }

        // 4. PDF 文件
        if (ext === "pdf") {
          setContent(
            <div className="max-w-full">
              <PDFViewer fileUrl={fileUrl} />
            </div>
          );
          return;
        }

        // 5. 视频
        if (["mp4", "avi", "mov"].includes(ext)) {
          setContent(
            <video controls className="max-w-full max-h-96" src={fileUrl} />
          );
          return;
        }

        // 6. 音频
        if (["mp3", "m4a", "wav"].includes(ext)) {
          setContent(
            <audio controls className="w-full" src={fileUrl} />
          );
          return;
        }

        // 7. docx
        if (ext === "docx") {
          const mammoth = (await import('mammoth')).default;
          const response = await safeFetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          
          if (mounted) {
            setContent(<div className="prose max-w-full" dangerouslySetInnerHTML={{ __html: result.value }} />);
          }
          return;
        }

        // 8. xlsx
        if (ext === "xlsx") {
          const XLSX = await import('xlsx');
          const response = await safeFetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const html = XLSX.utils.sheet_to_html(sheet);
          
          if (mounted) {
            setContent(<div className="overflow-auto max-w-full" dangerouslySetInnerHTML={{ __html: html }} />);
          }
          return;
        }

        // 其它类型
        setError({ message: '暂不支持该文件类型的在线预览' });
      } catch (err) {
        console.error('文件处理错误:', err);
        if (mounted) {
          if ((err as FetchError).status) {
            setError(err as FetchError);
          } else {
            setError({
              message: err instanceof Error ? err.message : '文件处理失败',
              status: 500
            });
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFile();

    return () => {
      mounted = false;
    };
  }, [fileUrl, fileName, ext, viewerVisible]);

  if (loading) {
    return <div className="text-gray-500 py-8 text-center">正在加载文件预览...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 py-8 text-center">
        <p>{error.message}</p>
        {error.status !== 404 && (
          <a href={fileUrl} download className="text-blue-600 hover:underline text-sm mt-2 block">
            点击下载文件
          </a>
        )}
      </div>
    );
  }

  return <div>{content}</div>;
};

// 导出带错误边界的组件
export default function MediaViewerWithErrorBoundary(props: MediaViewerProps) {
  return (
    <ErrorBoundary>
      <MediaViewer {...props} />
    </ErrorBoundary>
  );
} 