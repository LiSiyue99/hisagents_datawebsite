/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export' as const,
  typescript: {
    ignoreBuildErrors: true,
  },
};

import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
 
export default withNextIntl(nextConfig);
