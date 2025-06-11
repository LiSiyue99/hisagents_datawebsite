import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // 为 `locale` 提供一个回退值或确保它总是一个字符串
  const resolvedLocale = locale || 'zh';

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});