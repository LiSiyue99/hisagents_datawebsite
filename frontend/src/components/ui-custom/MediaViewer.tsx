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
  const [isViewingInBrowser, setIsViewingInBrowser] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  // 检查是否是reference类型
  if (fileUrl.toLowerCase().startsWith('reference:')) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700">{fileUrl}</p>
      </div>
    );
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // 从完整URL中提取文件名
  const displayFileName = fileName.includes('/') 
    ? fileName.split('/').pop() || fileName 
    : fileName;

  const handleViewInBrowser = async () => {
    setIsViewingInBrowser(true);
    try {
      let convertedBlob: Blob | null = null;

      if (['heic', 'heif'].includes(ext)) {
        // 方案一: 尝试通过 OSS 即时转换
        try {
          const ossUrl = `${fileUrl}?x-oss-process=image/format,jpg`;
          const response = await fetch(ossUrl);
          if (!response.ok) throw new Error('OSS request failed');
          const blob = await response.blob();
          if (blob.type !== 'image/jpeg') {
            throw new Error(`OSS did not return JPEG, but ${blob.type}`);
          }
          convertedBlob = blob;
        } catch (ossError) {
          console.warn('OSS conversion failed, falling back to client-side conversion:', ossError);
          // 方案二: 客户端转换
          const heic2any = (await import('heic2any')).default;
          const originalResponse = await safeFetch(fileUrl);
          const originalBlob = await originalResponse.blob();
          const result = await heic2any({ blob: originalBlob, toType: 'image/jpeg' });
          convertedBlob = Array.isArray(result) ? result[0] : result;
        }
      } else {
        // 对于其他可直接预览的文件类型
        const response = await safeFetch(fileUrl);
        convertedBlob = await response.blob();
      }

      if (convertedBlob) {
        const objectUrl = URL.createObjectURL(convertedBlob);
        window.open(objectUrl, '_blank', 'noopener,noreferrer');
        // 浏览器通常会在标签页关闭时自动回收blob URL，但手动管理更保险
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      } else {
        throw new Error('无法获取可预览的文件版本');
      }
    } catch (viewError) {
      console.error('Failed to view file in browser:', viewError);
      setError({
        message: '无法在浏览器中打开，请尝试直接下载文件。',
      });
    } finally {
      setIsViewingInBrowser(false);
    }
  };

  // 安全的 fetch 函数
  const safeFetch = async (url: string): Promise<Response> => {
    try {
      // 1. 如果是相对路径，直接获取
      if (url.startsWith('/')) {
        const response = await fetch(url, { next: { revalidate: 0 } });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      }
      
      // 2. 对于外部 URL，优先直接获取（CORS 配置好后，这应该是首选）
      try {
        const response = await fetch(url, {
          headers: { 'Accept': '*/*' },
          next: { revalidate: 0 },
        });
        // 如果响应不是2xx，或者是一个不透明重定向（opaque redirect），则认为直接获取失败，尝试代理
        // 不透明重定向通常是CORS策略不完全匹配的标志
        if (!response.ok || response.type === 'opaque') {
          throw new Error(`Direct fetch failed with status: ${response.status} or opaque response`);
        }
        return response;
      } catch (error) {
        console.warn(`Direct fetch for ${url} failed, falling back to proxy. Error:`, error);
        
        // 3. 使用代理作为备用方案
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl, {
          next: { revalidate: 0 },
        });
        
        if (!proxyResponse.ok) {
          throw new Error(`Proxy fetch failed with status: ${proxyResponse.status}`);
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
          let url = '';
          try {
            // 1. 导入模块
            let heic2any;
            try {
              const heic2anyModule = await import('heic2any');
              heic2any = heic2anyModule.default || heic2anyModule;
              if (!heic2any) {
                throw new Error('HEIC 转换模块加载失败');
              }
            } catch (importError) {
              if (mounted) {
                setError({
                  message: '无法加载 HEIC 转换模块，请检查网络连接',
                  status: 500
                });
              }
              return;
            }

            // 2. 获取文件内容
            let blob;
            try {
              const response = await safeFetch(fileUrl);
              blob = await response.blob();
              
              // 验证文件大小（如果超过 50MB 可能会导致浏览器崩溃）
              if (blob.size > 50 * 1024 * 1024) {
                throw new Error('文件太大，无法在浏览器中处理');
              }
            } catch (fetchError) {
              if (mounted) {
                setError({
                  message: '无法获取 HEIC 文件，请检查文件是否可访问',
                  status: (fetchError as FetchError).status || 500
                });
              }
              return;
            }

            // 3. 转换 HEIC 到 JPEG
            let result;
            try {
              const conversionOptions = {
                blob,
                toType: "image/jpeg",
                quality: 0.8
              };
              result = await heic2any(conversionOptions);
              
              if (!result) {
                throw new Error('转换结果为空');
              }
            } catch (conversionError) {
              if (mounted) {
                const errorMessage = conversionError instanceof Error
                  ? `HEIC 转换失败: ${conversionError.message}`
                  : 'HEIC 转换过程中发生未知错误';
                setError({
                  message: errorMessage,
                  status: 500
                });
              }
              return;
            }

            // 4. 创建预览 URL
            try {
              if (Array.isArray(result)) {
                if (result.length === 0) {
                  throw new Error('转换结果为空数组');
                }
                url = URL.createObjectURL(result[0]);
              } else {
                url = URL.createObjectURL(result);
              }
            } catch (urlError) {
              if (mounted) {
                setError({
                  message: 'HEIC 转换成功但无法创建预览，请尝试下载文件',
                  status: 500
                });
              }
              return;
            }

            // 5. 渲染图片
            if (mounted) {
              setContent(
                <div>
                  <img 
                    src={url} 
                    alt={fileName} 
                    className="max-w-full max-h-96 object-contain rounded-lg cursor-pointer"
                    onClick={() => setViewerVisible(true)}
                    onError={() => {
                      if (mounted) {
                        setError({ 
                          message: 'HEIC 转换成功但图片显示失败，请尝试刷新页面',
                          status: 500 
                        });
                        if (url) {
                          URL.revokeObjectURL(url);
                        }
                      }
                    }}
                  />
                  <Viewer
                    visible={viewerVisible}
                    onClose={() => {
                      setViewerVisible(false);
                      if (url) {
                        URL.revokeObjectURL(url);
                      }
                    }}
                    images={[{ src: url, alt: fileName }]}
                    zoomable
                    rotatable
                    scalable
                  />
                </div>
              );
            }
          } catch (error: unknown) {
            // 最终的错误处理
            if (mounted) {
              let errorMessage = '处理 HEIC 图片时发生错误';
              let errorStatus = 500;

              if (error instanceof Error) {
                errorMessage = `HEIC 处理错误: ${error.message}`;
              } else if (typeof error === 'string') {
                errorMessage = `HEIC 处理错误: ${error}`;
              } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = `HEIC 处理错误: ${(error as { message: string }).message}`;
              }

              if (error && typeof error === 'object' && 'status' in error) {
                errorStatus = Number((error as { status: number }).status) || 500;
              }

              console.error('HEIC 处理详细错误:', {
                error,
                message: errorMessage,
                status: errorStatus
              });

              setError({
                message: errorMessage,
                status: errorStatus
              });
            }

            // 清理资源
            if (url) {
              URL.revokeObjectURL(url);
            }
          }
          return;
        }

        // 4. PDF 文件
        if (ext === "pdf") {
          const response = await safeFetch(fileUrl);
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          objectUrlsRef.current.push(objectUrl);

          if (mounted) {
            setContent(
              <div className="max-w-full">
                <PDFViewer fileUrl={objectUrl} />
              </div>
            );
          }
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
          const errorMessage = err instanceof Error ? err.message : '文件处理失败，请稍后重试';
          setError({
            message: errorMessage,
            status: (err as FetchError).status || 500
          });
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
      // 组件卸载或 effect 重新运行时，清理创建的 object-url
      objectUrlsRef.current.forEach(URL.revokeObjectURL);
      objectUrlsRef.current = [];
    };
  }, [fileUrl, fileName, ext, viewerVisible]);

  if (loading) {
    return <div className="text-gray-500 py-8 text-center">正在加载文件预览...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-center p-6 rounded-lg">
        <p className="text-base font-semibold text-red-800 mb-4">{error.message}</p>
        {error.status !== 404 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handleViewInBrowser}
              disabled={isViewingInBrowser}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isViewingInBrowser ? '正在处理...' : '🌐 在浏览器中查看'}
            </button>
            <a
              href={fileUrl}
              download={displayFileName}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              📥 下载文件
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium">文件名：</span>
          <span className="font-normal">{displayFileName}</span>
        </p>
        <a
          href={fileUrl}
          download={displayFileName}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
        </a>
      </div>
      {content}
    </div>
  );
};

// 导出带错误边界的组件
export default function MediaViewerWithErrorBoundary(props: MediaViewerProps) {
  return (
    <ErrorBoundary>
      <MediaViewer {...props} />
    </ErrorBoundary>
  );
} 