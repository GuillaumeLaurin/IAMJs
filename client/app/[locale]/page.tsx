import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");
  const c = useTranslations("common");

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
            IA
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {c("appName")}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/register"
            className="text-sm bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {t("getStarted")}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          {t("badge")}
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] max-w-3xl">
          {t("heroLine1")}
          <br />
          <span className="text-blue-600">{t("heroLine2")}</span>
        </h1>

        <p className="mt-6 text-lg text-slate-500 max-w-xl leading-relaxed">
          {t("heroDescription")}
        </p>

        <div className="flex items-center gap-4 mt-10">
          <Link
            href="/register"
            className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm shadow-lg shadow-blue-500/20"
          >
            {t("ctaPrimary")}
          </Link>
          <a
            href="#features"
            className="border border-slate-200 hover:border-slate-300 text-slate-600 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
          >
            {t("ctaSecondary")}
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-12 mt-20 pt-10 border-t border-slate-200/60">
          {[
            { value: "12k+", label: t("statUsers") },
            { value: "99.9%", label: t("statUptime") },
            { value: "<50ms", label: t("statResponse") },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-slate-200/60 text-center text-xs text-slate-400">
        {c("copyright")}
      </footer>
    </div>
  );
}