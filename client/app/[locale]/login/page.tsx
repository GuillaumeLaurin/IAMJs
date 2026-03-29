import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LoginForm from "@/components/features/login-form/login-form";
import LocaleSwitcher from "@/components/ui/locale-switcher/locale-switcher";

export default function LoginPage() {
  const t = useTranslations("login");
  const c = useTranslations("common");

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans text-slate-900 overflow-hidden flex items-center justify-center relative">
      {/* ── Background décoratif ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[70%] bg-blue-200/20 rounded-full blur-[120px] rotate-12" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[60%] bg-slate-200/30 rounded-full blur-[100px] -rotate-12" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-orange-200/20 rounded-full blur-[80px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── Contenu principal ── */}
      <main className="relative w-full max-w-6xl px-6 flex items-center justify-center lg:justify-between gap-20">
        {/* ── Panneau gauche : Branding ── */}
        <div className="hidden lg:flex flex-col max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
              IA
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {c("appName")}
            </h1>
          </Link>

          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold leading-tight">
              {t("heroPrefix")}{" "}
              <span className="text-blue-600 italic">{t("heroAccent")}</span>{" "}
              {t("heroSuffix")}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed max-w-sm">
              {t("heroDescription")}
            </p>
          </div>

          <div className="mt-16">
            <blockquote className="text-lg font-semibold text-slate-700 leading-relaxed mb-6">
              {t("testimonial")}
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  "bg-gradient-to-br from-blue-400 to-blue-600",
                  "bg-gradient-to-br from-emerald-400 to-emerald-600",
                  "bg-gradient-to-br from-amber-400 to-amber-600",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full border-[3px] border-[#f7f9fb] ${bg} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {["MD", "JL", "AK"][i]}
                  </div>
                ))}
                <div className="h-10 px-4 rounded-full border-[3px] border-[#f7f9fb] bg-slate-200 flex items-center text-slate-600 text-xs font-bold">
                  {t("members")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Panneau droit : Login Card (Glass) ── */}
        <div className="w-full max-w-md">
          <div
            className="rounded-[2rem] p-10 shadow-[0_12px_32px_rgba(25,28,30,0.06)] ring-1 ring-slate-200/30"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {/* Header mobile + switcher */}
            <div className="flex items-center justify-between mb-10">
              <div className="lg:hidden">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    IA
                  </div>
                  <span className="font-extrabold text-xl tracking-tight">
                    {c("appName")}
                  </span>
                </Link>
              </div>
              <div className="ml-auto">
                <LocaleSwitcher />
              </div>
            </div>

            <LoginForm />
          </div>

          {/* Footer links */}
          <div className="mt-8 flex justify-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">
              {c("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">
              {c("terms")}
            </Link>
            <Link href="/status" className="hover:text-blue-600 transition-colors">
              {c("status")}
            </Link>
          </div>
        </div>
      </main>

      {/* ── Floating Security Badge ── */}
      <div className="fixed bottom-10 left-10 hidden xl:block">
        <div
          className="p-4 rounded-2xl flex items-center gap-4 shadow-xl ring-1 ring-slate-200/30"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {c("encrypted")}
            </p>
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
              {c("securityActive")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}