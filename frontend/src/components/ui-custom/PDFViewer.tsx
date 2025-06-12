'use client';

import React from 'react';
import { Viewer, TextDirection } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import type { LoadError } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';

// 导入样式
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  // 创建默认布局插件实例
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],  // 禁用侧边栏
  });

  // 如果是外部链接，通过代理获取 (This logic is now handled by MediaViewer)
  // const resolvedUrl = fileUrl.startsWith('/') ? fileUrl : `/api/proxy?url=${encodeURIComponent(fileUrl)}`;

  const handleDocumentLoad = (doc: any) => {
    console.log('PDF 加载成功，总页数:', doc.numPages);
  };

  return (
    <div className="h-[800px] w-full border rounded-lg overflow-hidden bg-white">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
          defaultScale={1}
          onDocumentLoad={handleDocumentLoad}
          renderError={(error: LoadError) => (
            <div className="text-red-500 p-4">
              <p>PDF 加载失败</p>
              <p className="text-sm mt-2">{error.message}</p>
            </div>
          )}
          renderLoader={(percentages: number) => (
            <div className="text-gray-500 p-4">
              正在加载 PDF... {Math.round(percentages)}%
            </div>
          )}
          theme={{
            theme: 'auto',
            direction: TextDirection.LeftToRight,
          }}
        />
      </Worker>
    </div>
  );
} 