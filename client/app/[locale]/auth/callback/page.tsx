'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('callback');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      setError(t('noToken'));
      setTimeout(() => router.replace('/login'), 3000);
      return;
    }

    localStorage.setItem('accessToken', accessToken);
    router.replace('/dashboard');
  }, [searchParams, router, t]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <p className="text-xs text-slate-400">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 size={32} className="mx-auto animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">{t('loading')}</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
