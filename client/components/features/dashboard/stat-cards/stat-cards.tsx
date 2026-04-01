import { useTranslations } from "next-intl";

export interface BackupStatCardProps {
  lastSyncedMinutesAgo: number;
}

/**
 * BackupStatCard
 */
export function BackupCard({ lastSyncedMinutesAgo }: BackupStatCardProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="flex-1 bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
      <div className="relative z-10">
        <span 
          className="material-symbols-outlined text-4xl mb-4 text-indigo-300"
          style={{ fontVariationSettings: "'FILL' 1"}}
        >
          cloud_upload
        </span>
        <h3 className="text-xl font-bold mb-2">{t('instantBackup')}</h3>
        <p className="text-indigo-200/80 text-sm leading-relaxed mb-6">
          {t('workspaceSynced')} {lastSyncedMinutesAgo} {t('minutesAgo')}
        </p>
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold transition-all">
          {t('verifyIntegrity')}
        </button>
      </div>
      {/* Decorative blob */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-400/30 transition-all" />
    </div>
  );
}

export type TaskPriority = 'amber' | 'indigo' | 'red' | 'green';

export interface PendingTask {
  id: string;
  label: string;
  priority: TaskPriority;
}

export interface PendingTasksCardProps {
  tasks: PendingTask[];
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
};

/**
 * PendingTasksCard
 */
export function PendingTasksCard({ tasks }: PendingTasksCardProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="flex-1 bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <h4 className="font-headline font-bold text-slate-800">
          {t('pendingTask')}
        </h4>
        <span className="w-6 h-6 bg-error text-white text-[10px] font-black flex items-center justify-center rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3 mt-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all cursor-pointer"
          >
            <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]}`} />
            <span className="text-xs font-medium text-slate-600">
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}