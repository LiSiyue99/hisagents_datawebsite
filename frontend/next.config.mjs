import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hisagent-0612.oss-cn-shanghai.aliyuncs.com',
        pathname: '/HistBench_complete/**',
      },
    ],
    domains: ['hisagent-0612.oss-cn-shanghai.aliyuncs.com'],
  },
  webpack: (config, { isServer }) => {
    // 必要的 fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      canvas: false,
      encoding: false,
    };

    // 移除错误的 worker alias 配置
    if (config.resolve.alias) {
      delete config.resolve.alias.worker;
    }

    // 添加 worker-loader 规则
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: {
        loader: 'worker-loader',
        options: {
          filename: '[name].[contenthash].worker.js',
          publicPath: '/_next/static/chunks/',
        },
      },
    });

    return config;
  },
  transpilePackages: ['pdfjs-dist'],
  output: 'standalone',
};

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

export default withNextIntl(nextConfig);
