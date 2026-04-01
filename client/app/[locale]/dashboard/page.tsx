'use client';

import FeaturedDocumentCard from '@/components/features/dashboard/featured-document-card/featured-document-card';
import {
  BackupStatCard,
  PendingTasksCard,
  PendingTask,
} from '@/components/features/dashboard/stat-cards/stat-cards';
import {
  RecentActivityList,
  DocumentListItemProps,
} from '@/components/features/dashboard/document-list-item/document-list-item';
import FAB from '@/components/ui/fab/fab';
import { useTranslations } from 'next-intl';
import useGreeting from '@/hooks/use-greeting';

// ── Mock data (replace with real API calls / server component fetching) ─────────

const FEATURED_COLLABORATORS = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtqh76j5cfi1BoCrB08k7CqBSL8bjpuE7eLlR3LIF9dHJ1vxtUzDJN7R890QbCy1al1WRZtJ45r97nX5PrQLNOrFTDSKjsX-0bkvndhPd769ojGSb80JkgUIq5W0UrX4nsy_wO-yS_IpRdcKx-g8Hmr1kAyMyLvV26kz5cdnDaNDrjZ2ODTHaIh-0gS_3zDjuKV1qHgTBOYSFu-FpQWYrQXH3JIeZnB_yvL8FOSupMHgZqD7goa5S5b5PgNPCcTKGGosozo3tvHnEx',
    alt: 'Collaborator Sarah',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVi1MIuq3MtJCMCUCTLFjJD_oMH_U0YsrJMe-bFlzAo5ERF7cDf-twvI4RjNo76wJiPMmbf0h_0RsF8nKT7S80D_cjeta6287AeKITJBIT7BleMq9rdxEcfX0PczmMdVr105NR5G7j21D_pOGXap9gDMsjbTg269O42v4BPCx7GWC24S5WWq63eKl_VygjRjmZWeGQe8myZJw_dF5GGF6kCCP80r4K6FdjSdWJwwWYWSxNIjY030VdYtMODD8LZPI6gd8cv5ZzKuhI',
    alt: 'Collaborator James',
  },
];

const PENDING_TASKS: PendingTask[] = [
  { id: '1', label: "Review 'Legal_Draft_V4'", priority: 'amber' },
  { id: '2', label: "Approve 'Project_Invoice'", priority: 'indigo' },
  { id: '3', label: "Sign 'NDA_Studio_X'", priority: 'red' },
  { id: '4', label: "Update 'Brand_Guidelines'", priority: 'green' },
];

const RECENT_DOCUMENTS: DocumentListItemProps[] = [
  {
    title: 'Annual Marketing Budget 2024',
    folder: 'Finance / Q4',
    updatedLabel: 'Updated Oct 12',
    iconName: 'article',
    iconColor: 'indigo',
    owners: [
      { initials: 'MK', colorClass: 'bg-slate-200' },
      { initials: 'JD', colorClass: 'bg-slate-800', textColorClass: 'text-white' },
    ],
  },
  {
    title: 'Brand Guidelines Update_FINAL',
    folder: 'Design / Assets',
    updatedLabel: 'Updated Yesterday',
    iconName: 'description',
    iconColor: 'teal',
    owners: [{ initials: 'AR', colorClass: 'bg-indigo-100' }],
  },
  {
    title: 'Legal Agreement - Studio X',
    folder: 'Legal / Contracts',
    updatedLabel: 'Updated 3 days ago',
    iconName: 'picture_as_pdf',
    iconColor: 'amber',
    owners: [
      { initials: 'SX', colorClass: 'bg-slate-900', textColorClass: 'text-white' },
      { initials: 'TC', colorClass: 'bg-slate-100' },
    ],
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

/**
 * DashboardPage
 * Route: /[locale]/dashboard
 */
const DashboardPage = () => {
  const t = useTranslations('dashboard');
  const greeting = useGreeting();
  return (
    <div className="p-12 max-w-[1400px] mx-auto">
      {/* Hero header */}
      <section className="mb-12 flex justify-between items-end">
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-900 dark:text-white mb-4">
            {greeting} John.
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            {t('youHave')}
            {''}
            <span className="text-primary font-bold">
              {PENDING_TASKS.length} {t('documents')}
            </span>{' '}
            {t('documentAction')}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex gap-2">
          <button className="p-3 bg-surface-container-lowest shadow-sm rounded-xl text-on-surface-variant hover:bg-surface-bright transition-all">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="p-3 bg-surface-container-low rounded-xl text-primary font-bold transition-all">
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </section>
      {/* Bento grid */}
      <section className="grid grid-cols-12 gap-6 mb-16">
        <FeaturedDocumentCard
          title="Q4 Architectural Strategy.pdf"
          lastEditedBy="Sarah Chen"
          lastEditedAt="2 hours ago"
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuA4--zd2g4i0I3S-UrYHgSg5GvcAzViXUFozs34d31-HE3NdOL5oCFiQPhpwJRgJlDKoi88Pk-rNdkY2rttFVN0NXzZcn-xGSJmVsdysYFvkSF3tlSNiIP-DbVvdbedIw2qaro7fkoOB36r9Y-rpmNMAuyvVXAHP3GuSl33RMNFl9d5N9ATQ6vEX3f0D4MURN8xxn3FVMiavYF1WzE4nPV2OEiURhIpmOcyVSk2tJ7TPmzuqKUcIc_Pq2l6-rkRWsan8vkvBpGU2pe1"
          imageAlt="Architectural blueprints"
          collaborators={FEATURED_COLLABORATORS}
          extraCollaboratorsCount={3}
        />

        <div className="col-span-4 flex flex-col gap-6">
          <BackupStatCard lastSyncedMinutesAgo={12} />
          <PendingTasksCard tasks={PENDING_TASKS.slice(0, 2)} />
        </div>
      </section>

      {/* Recent activity */}
      <RecentActivityList documents={RECENT_DOCUMENTS} />

      {/* Keyboard shortcut hint */}
      <div className="flex justify-center mt-12 pb-12">
        <div className="bg-surface-container-high/50 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span className="material-symbols-outlined text-indigo-500">info</span>
          {t('tip')}
          {''}
          {t('use')}
          <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
            CMD
          </kbd>{' '}
          +{' '}
          <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px]">K</kbd>{' '}
          {t('infoCmdK')}
        </div>
      </div>
    </div>
  );
};
