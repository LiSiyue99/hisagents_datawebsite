'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('LanguageSwitcher');

  const switchLocale = (nextLocale: string) => {
    if (nextLocale === locale) return;

    const pathWithoutLocale = pathname.replace(/^\/(?:en|zh)(?=\/|$)/, '') || '/';

    router.replace(pathWithoutLocale, { locale: nextLocale });
  };

  return (
    <div className="flex items-center">
      <Globe className="h-5 w-5 mr-2" />
      <Select onValueChange={switchLocale} defaultValue={locale}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={t('language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('english')}</SelectItem>
          <SelectItem value="zh">{t('chinese')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 