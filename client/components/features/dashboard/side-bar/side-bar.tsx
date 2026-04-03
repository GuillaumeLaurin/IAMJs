'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}

/**
 * Sidebar
 */
export default function Sidebar() {
  const t = useTranslations('dashboard');
  const c = useTranslations('common');

  const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard', active: true },
  { href: '/dashboard/todo', icon: 'sticky_note', label: 'Todo' },
  { href: '/dashboard/documents', icon: 'description', label: 'All Documents' },
  { href: '/dashboard/shared', icon: 'group', label: 'Shared with Me' },
  { href: '/dashboard/recent', icon: 'schedule', label: 'Recent' },
  { href: '/dashboard/trash', icon: 'delete', label: 'Trash' },
];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col py-6 px-4 space-y-2 z-50">
      {/* Logo */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined">architecture</span>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-black text-indigo-900 dark:text-white leading-tight">
            {c('appName')}
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            {t('workspace')}
          </p>
        </div>
      </div>
      {/* New Document CTA */}
      <button className="mx-2 mb-6 bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-[0_12px_32px_rgba(0,50,181,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
        <span className="material-symbols-outlined text-sm">add</span>
        {t('newDocument')}
      </button>
      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, icon, label, active }) =>
          active ? (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2 text-indigo-700 dark:text-indigo-300 relative after:content-[''] after:absolute after:left-0 after:w-1 after:h-6 after:bg-indigo-600 after:rounded-r-full font-manrope text-sm font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-md transition-all"
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </Link>
          ) : (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 font-manrope text-sm font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-md transition-all hover:translate-x-1 duration-200"
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </Link>
          ),
        )}
      </nav>
      {/* Bottom section */}
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link
          href="/help"
          className="flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 font-manrope text-sm font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-md transition-all"
        >
          <span className="material-symbols-outlined">help</span>
          {t('helpCenter')}
        </Link>
        {/* Storage bar */}
        <StorageBar used={82} />
      </div>
    </aside>
  );
}

function StorageBar({ used }: { used: number }) {
  return (
    <div className="px-4 py-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          Storage
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${used}%` }}
        />
      </div>
    </div>
  );
}
