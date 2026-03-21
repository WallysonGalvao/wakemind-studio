import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";

import logo from "@/assets/images/fenrir.png";
import studioLogo from "@/assets/images/three-wolves.webp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

type LoginFields = { email: string; password: string };

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [serverError, setServerError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const signInSchema = React.useMemo(
    () =>
      z.object({
        email: z.email(t("auth.emailInvalid")),
        password: z.string().min(1, t("auth.passwordMinLength")),
      }),
    [t],
  );

  const signUpSchema = React.useMemo(
    () =>
      z.object({
        email: z.email(t("auth.emailInvalid")),
        password: z
          .string()
          .min(8, t("auth.passwordMinLength"))
          .regex(/[A-Z]/, t("auth.passwordUppercase"))
          .regex(/[a-z]/, t("auth.passwordLowercase"))
          .regex(/[0-9]/, t("auth.passwordNumber"))
          .regex(/[^A-Za-z0-9]/, t("auth.passwordSpecial")),
      }),
    [t],
  );

  const schema = mode === "signin" ? signInSchema : signUpSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ email, password }: LoginFields) {
    setServerError("");
    setMessage("");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setServerError(error.message);
        return;
      }
      await navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setServerError(error.message);
        return;
      }
      setMessage(t("auth.checkEmail"));
      setMode("signin");
    }
  }

  function handleSwitchToSignup() {
    setMode("signup");
    setServerError("");
  }

  function handleSwitchToSignin() {
    setMode("signin");
    setServerError("");
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setServerError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-6">
          <div className="flex size-32 items-center justify-center rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-border/50">
            <img src={logo} alt="Three Wolves" className="size-full object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {t("auth.appName")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {mode === "signin" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
            </p>
          </div>
        </div>

        {/* Server error / success message */}
        {serverError && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
            {message}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute top-0 right-0 flex h-full items-center px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t("common.loading")
              : mode === "signin"
                ? t("auth.signIn")
                : t("auth.signUp")}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t("common.or")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google OAuth */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t("auth.continueWithGoogle")}
        </Button>

        {/* Toggle signup/signin */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              {t("auth.dontHaveAccount")}{" "}
              <button
                type="button"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                onClick={handleSwitchToSignup}
              >
                {t("auth.signUp")}
              </button>
            </>
          ) : (
            <>
              {t("auth.alreadyHaveAccount")}{" "}
              <button
                type="button"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                onClick={handleSwitchToSignin}
              >
                {t("auth.signIn")}
              </button>
            </>
          )}
        </p>

        {/* Studio Signature */}
        <div className="mt-12 flex flex-col items-center gap-2 opacity-40 transition-opacity hover:opacity-100">
          <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            A tool by
          </span>
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-white p-0.5 shadow-sm ring-1 ring-border/50">
              <img
                src={studioLogo}
                alt="Three Wolves"
                className="size-full object-contain"
              />
            </div>
            <span className="text-xs font-bold tracking-tight text-foreground">
              Three Wolves
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
