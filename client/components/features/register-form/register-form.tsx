"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Calendar, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/axios";
import { AccessTokenDto } from "@/dto/access-token.dto";
import axios, {AxiosError } from 'axios';
import { navigateTo } from "@/lib/navigate";

interface SignUpDto {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: "f" | "m" | "o";
  password: string;
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

const MIN_AGE = 18;
const MAX_AGE = 100;

export default function RegisterForm() {
  const t = useTranslations("register");
  const v = useTranslations("validation");

  const registerSchema = z
      .object({
        firstName: z.string().min(2, v("firstNameRequired")),
        lastName: z.string().min(2, v("lastNameRequired")),
        age: z
          .number()
          .min(MIN_AGE, v("ageMin"))
          .max(MAX_AGE, v("ageMax")),
        gender: z.enum(["f", "m", "o"], v("genderRequired")),
        email: z.email(v("emailInvalid")).min(1, v("emailRequired")),
        password1: z
          .string()
          .min(1, v("passwordRequired"))
          .regex(PASSWORD_REGEX, v("passwordInvalid")),
        password2: z
          .string()
          .min(1, v("passwordRequired")),
      })
      .refine((data) => data.password1 === data.password2, {
        message: v("passwordDifferent"),
        path: ["password2"],
      });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: MIN_AGE,
      gender: "m",
      email: "",
      password1: "",
      password2: "",
    },
  });

  function convertSchemaToDto(data: RegisterFormData): SignUpDto {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      age: Number(data.age),
      gender: data.gender,
      password: data.password1,
    };
  }

  async function onSubmit(schema: RegisterFormData): Promise<void> {
    setServerError(null);
    try {
      await api.post<AccessTokenDto>('/auth/signup', convertSchemaToDto(schema));
      navigateTo("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message ?? t("serverError");
        setServerError(message);
      }
    }
  }

  function handleOAuth(provider: "google" | "github"): void {
    navigateTo(`${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`);
  }

  /* ── Shared input class builder ── */
  const inputCls = (hasError: boolean) =>
    `w-full bg-slate-100/80 border-none rounded-xl py-4 pl-12 pr-4
     text-sm text-slate-900 placeholder:text-slate-400
     outline-none transition-all
     focus:ring-2 focus:ring-blue-500/20 focus:bg-white
     ${hasError ? "ring-2 ring-red-300" : ""}`;

  return (
    <div className="space-y-8">
      {/* ── En-tête ── */}
      <div className="text-center">
        <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
          {t("title")}
        </h3>
        <p className="text-slate-500 text-sm">{t("subtitle")}</p>
      </div>

      {/* ── Boutons OAuth ── */}
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
          <span className="text-sm font-semibold text-slate-700">{t("google")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuth("github")}
          className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95"
        >
          <svg className="w-5 h-5 fill-slate-800" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">{t("github")}</span>
        </button>
      </div>

      {/* ── Séparateur ── */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-slate-200/60" />
        <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {t("orByEmail")}
        </span>
        <div className="flex-grow border-t border-slate-200/60" />
      </div>

      {/* ── Erreur serveur ── */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {serverError}
        </div>
      )}

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* First Name + Last Name */}
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider"
            >
              {t("firstNameLabel")}
            </label>
            <div className="relative group">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
              />
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder={t("firstNamePlaceholder")}
                className={inputCls(!!errors.firstName)}
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-red-500 ml-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider"
            >
              {t("lastNameLabel")}
            </label>
            <div className="relative group">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
              />
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder={t("lastNamePlaceholder")}
                className={inputCls(!!errors.lastName)}
                {...register("lastName")}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-red-500 ml-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <label
              htmlFor="age"
              className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider"
            >
              {t("ageLabel")}
            </label>
            <div className="relative group">
              <Calendar
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
              />
              <input
                id="age"
                type="number"
                min={MIN_AGE}
                max={MAX_AGE}
                autoComplete="off"
                placeholder={String(MIN_AGE)}
                className={inputCls(!!errors.age)}
                {...register("age", { valueAsNumber: true })}
              />
            </div>
            {errors.age && (
              <p className="text-xs text-red-500 ml-1">{errors.age.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label
              htmlFor="gender"
              className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider"
            >
              {t("genderLabel")}
            </label>
            <div className="relative group">
              <Users
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 pointer-events-none"
              />
              <select
                id="gender"
                className={`
                  w-full bg-slate-100/80 border-none rounded-xl py-4 pl-12 pr-4
                  text-sm text-slate-900
                  outline-none transition-all appearance-none cursor-pointer
                  focus:ring-2 focus:ring-blue-500/20 focus:bg-white
                  ${errors.gender ? "ring-2 ring-red-300" : ""}
                `}
                {...register("gender")}
              >
                <option value="m">{t("genderMale")}</option>
                <option value="f">{t("genderFemale")}</option>
                <option value="o">{t("genderOther")}</option>
              </select>
            </div>
            {errors.gender && (
              <p className="text-xs text-red-500 ml-1">{errors.gender.message}</p>
            )}
          </div>
        </div>

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
              className={inputCls(!!errors.email)}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password1"
            className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider"
          >
            {t("passwordLabel")}
          </label>
          <div className="relative group">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
            />
            <input
              id="password1"
              type={showPassword1 ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              className={`${inputCls(!!errors.password1)} pr-12`}
              {...register("password1")}
            />
            <button
              type="button"
              onClick={() => setShowPassword1(!showPassword1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              aria-label={showPassword1 ? t("hidePassword") : t("showPassword")}
            >
              {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password1 && (
            <p className="text-xs text-red-500 ml-1">{errors.password1.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="password2"
            className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider"
          >
            {t("passwordConfirmationLabel")}
          </label>
          <div className="relative group">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
            />
            <input
              id="password2"
              type={showPassword2 ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              className={`${inputCls(!!errors.password2)} pr-12`}
              {...register("password2")}
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              aria-label={showPassword2 ? t("hidePassword") : t("showPassword")}
            >
              {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password2 && (
            <p className="text-xs text-red-500 ml-1">{errors.password2.message}</p>
          )}
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

      {/* ── Lien connexion ── */}
      <p className="text-center text-sm text-slate-500">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-blue-600 font-bold hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}