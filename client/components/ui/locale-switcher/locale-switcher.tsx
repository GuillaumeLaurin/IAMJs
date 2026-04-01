'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const next = locale === 'fr' ? 'en' : 'fr';
    router.replace(pathname, { locale: next });
  }

  return (
    <button
      onClick={switchLocale}
      className="
        px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider
        bg-slate-100 hover:bg-slate-200 text-slate-600
        transition-colors
      "
      aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
