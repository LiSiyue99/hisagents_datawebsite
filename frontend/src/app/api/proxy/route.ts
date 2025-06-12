import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing "url" query parameter', { status: 400 });
    }

    // 防止 SSR 注入等安全风险，只允许 http/https
    if (!/^https?:\/\//i.test(targetUrl)) {
      return new Response('Invalid protocol', { status: 400 });
    }

    // 代理请求
    const upstreamRes = await fetch(targetUrl, {
      // 透传方法和头部会更复杂，这里简单示例只处理 GET
      headers: {
        Accept: '*/*',
      },
      // 不缓存
      next: { revalidate: 0 },
    });

    // 复制响应头
    const resHeaders = new Headers(upstreamRes.headers);
    // 允许跨域
    resHeaders.set('Access-Control-Allow-Origin', '*');
    // 一些源站可能带有 CSP，会阻止内联脚本，这里可以移除
    resHeaders.delete('content-security-policy');

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return new Response('Proxy fetch failed', { status: 500 });
  }
}

// 预检请求支持
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
} 