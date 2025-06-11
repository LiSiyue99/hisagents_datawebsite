/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 这里可继续添加其他需要的 Next.js 配置
};

import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
 
export default withNextIntl(nextConfig);
