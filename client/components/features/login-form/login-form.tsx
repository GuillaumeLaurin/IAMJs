"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navigateTo } from "@/lib/navigate";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export default function LoginForm() {
  const t = useTranslations("login");
  const v = useTranslations("validation");

  const loginSchema = z.object({
    email: z
        .email("format de l'email invalide"),
    password: z
        .string()
        .min(1, "Le mot de passe est requis")
        .regex(PASSWORD_REGEX,`Password must contain Minimum 8 and maximum 20 characters,
        at least one uppercase letter,
        one lowercase letter,
        one number and
        one special character.`),
    rememberMe: z.boolean().optional(),
});
  type LoginFormData = z.infer<typeof loginSchema>;

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json();
        setServerError(body.message ?? t("serverError"));
        return;
      }
      navigateTo("/dashboard");
    } catch {
      setServerError(t("serverError"));
    }
  }

  function handleOAuth(provider: "google" | "github") {
    navigateTo(`/api/auth/${provider}`);
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
          {t("title")}
        </h3>
        <p className="text-slate-500 text-sm">{t("subtitle")}</p>
      </div>

      {/* Boutons OAuth */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">
            {t("google")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuth("github")}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95"
        >
          <svg className="w-5 h-5 fill-slate-800" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">
            {t("github")}
          </span>
        </button>
      </div>

      {/* Séparateur */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-slate-200/60" />
        <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {t("orByEmail")}
        </span>
        <div className="flex-grow border-t border-slate-200/60" />
      </div>

      {/* Erreur serveur */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {serverError}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider"
          >
            {t("emailLabel")}
          </label>
          <div className="relative group">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className={`
                w-full bg-slate-100/80 border-none rounded-xl py-4 pl-12 pr-4
                text-sm text-slate-900 placeholder:text-slate-400
                outline-none transition-all
                focus:ring-2 focus:ring-blue-500/20 focus:bg-white
                ${errors.email ? "ring-2 ring-red-300" : ""}
              `}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              {t("passwordLabel")}
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider"
            >
              {t("forgot")}
            </Link>
          </div>
          <div className="relative group">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("passwordPlaceholder")}
              className={`
                w-full bg-slate-100/80 border-none rounded-xl py-4 pl-12 pr-12
                text-sm text-slate-900 placeholder:text-slate-400
                outline-none transition-all
                focus:ring-2 focus:ring-blue-500/20 focus:bg-white
                ${errors.password ? "ring-2 ring-red-300" : ""}
              `}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 ml-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-3 px-1">
          <input
            id="rememberMe"
            type="checkbox"
            className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0"
            {...register("rememberMe")}
          />
          <label
            htmlFor="rememberMe"
            className="text-sm text-slate-500 font-medium cursor-pointer select-none"
          >
            {t("rememberMe")}
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full py-4 rounded-xl text-sm font-bold
            bg-gradient-to-r from-blue-700 to-blue-500
            text-white shadow-xl shadow-blue-500/20
            hover:shadow-2xl hover:shadow-blue-500/30
            active:scale-[0.98] transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t("loading")}
            </>
          ) : (
            t("submit")
          )}
        </button>
      </form>

      {/* Lien inscription */}
      <p className="text-center text-sm text-slate-500">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="text-blue-600 font-bold hover:underline"
        >
          {t("requestAccess")}
        </Link>
      </p>
    </div>
  );
}