'use client';

import { useTranslations } from 'next-intl';

export type DocumentIconColor = 'indigo' | 'teal' | 'amber' | 'red' | 'green';

export type DocumentIconName = 'article' | 'description' | 'picture_as_pdf' | 'folder_open';

export interface DocumentOwner {
  initials: string;
  /** Tailwind bg + text classes, e.g. "bg-slate-200" */
  colorClass: string;
  textColorClass?: string;
}

export interface DocumentListItemProps {
  title: string;
  folder: string;
  updatedLabel: string;
  iconName: DocumentIconName;
  iconColor: DocumentIconColor;
  owners: DocumentOwner[];
  onShare?: () => void;
  onMore?: () => void;
}

const ICON_COLOR_MAP: Record<DocumentIconColor, string> = {
  indigo: 'text-indigo-600',
  teal: 'text-teal-600',
  amber: 'text-amber-600',
  red: 'text-red-600',
  green: 'text-green-600',
};

/**
 * DocumentListItem
 * A single row in the "Recent Activity" list.
 */
export function DocumentListItem({
  title,
  folder,
  updatedLabel,
  iconName,
  iconColor,
  owners,
  onShare,
  onMore,
}: DocumentListItemProps) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between hover:bg-surface-bright hover:shadow-lg transition-all duration-300">
      {/* Left: icon + meta */}
      <div className="flex items-center gap-6">
        <div
          className={`w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center ${ICON_COLOR_MAP[iconColor]}`}
        >
          <span className="material-symbols-outlined">{iconName}</span>
        </div>
      </div>
      <h4 className="font-bold text-slate-800">{title}</h4>
      <div className="flex items-center gap-4 mt-1">
        <span className="text-xs text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">folder</span>
          {folder}
        </span>
        <span className="text-xs text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
          {updatedLabel}
        </span>
      </div>
      {/* Right: owners + action */}
      <div className="flex items-center gap-8">
        <OwnerStack owners={owners} />
        <button onClick={onShare} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-slate-400">share</span>
        </button>
        <button onClick={onMore} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-slate-400">more_horiz</span>
        </button>
      </div>
    </div>
  );
}

function OwnerStack({ owners }: { owners: DocumentOwner[] }) {
  return (
    <div className="flex -space-x-2">
      {owners.map(({ initials, colorClass, textColorClass }, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-full border-2 border-white ${colorClass} ${textColorClass ?? 'text-slate-800'} flex items-center justify-center text-[10px] font-bold`}
        >
          {initials}
        </div>
      ))}
    </div>
  );
}

export interface RecentActivityListProps {
  documents: DocumentListItemProps[];
  onViewAll?: () => void;
}

/**
 * RecentActivityList
 *  Section wrapper with heading, "View All" link, and a list of DocumentListItems.
 */
export function RecentActivityList({ documents, onViewAll }: RecentActivityListProps) {
  const t = useTranslations('dashboard');
  return (
    <section className="bg-surface-container-low rounded-[2.5rem] p-8 mb-12">
      <div className="flex justify-between items-center mb-8 px-4">
        <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
        <button
          onClick={onViewAll}
          className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          {t('viewAllArchives')}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
      <div className="space-y-4">
        {documents.map((doc, i) => (
          <DocumentListItem key={i} {...doc} />
        ))}
      </div>
    </section>
  );
}
