import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支持的语言列表
  locales: ['en', 'zh'],

  // 默认语言
  defaultLocale: 'zh'
});

export const config = {
  // 匹配所有不包含 `.` (例如 api, _next, antd, favicon.ico) 的路径
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}; 