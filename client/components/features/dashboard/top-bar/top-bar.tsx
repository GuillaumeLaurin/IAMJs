import { useTranslations } from "use-intl"

/**
 * TopBar
 */
export default function TopBar() {
  const t = useTranslations('dashboard');

  return (
    <header className="w-full sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] flex justify-between items-center px-8 h-16">
      {/* Search */}
      <div className="flex items-center gap-6 w-full max-w-2xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input 
            className="w-full bg-surface-container-low border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-body"
            placeholder={t('searchPlaceHolder')}
            type="text"
            />
        </div>
      </div>
      {/* Actions + user */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
        <UseChip name="John Doe" avatarSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCvCpzK5kB8pmZYOeJh0kUQb-XlZcb5Y0oLclD4w4alCEIIdthsua6jpnCupgEQjSS54i42uoBPoHdLqeeNMUwcMF0Iz-yq8F9F44mhLdMjlJENJ1-_RJNxLa771YYBQMfYItrpkxANjiOpZ62yEkqNg0oH96CzlYfV0M7U8rsTUbNEjlh1NSByaeFtlacZ15MYm9WFViKt0PMc7MEPbQrEcqyLBeu0T4tjUDTfJN9ZYsonUi2bSCBRp0a9wtVEXyuJnofvrB--mwCv" />
      </div>
    </header>
  );
}

function UseChip({ name, avatarSrc }: { name: string; avatarSrc: string }) {
  return (
    <div className="flex items-center gap-3 pl-2">
      <img
        src={avatarSrc}
        alt={`${name} profile`}
        className="w-8 h-8 rounded-full ring-2 ring-primary/10"
      />
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {name}
      </span>
    </div>
  );
}