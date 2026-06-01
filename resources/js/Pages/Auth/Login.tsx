import { useState } from "react"
import { Head, Link, useForm } from '@inertiajs/react';

import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Card, CardContent } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/Components/ui/field"
import InputError from '@/Components/InputError';
import { useTranslation } from "@/lib/i18n";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <GuestLayout>
      <Head title={t('Log in')} />
      <div className={cn("flex flex-col gap-6")}>
          <Card className="overflow-hidden p-0 dark:bg-card">
            <CardContent className="grid p-0 md:grid-cols-2 shadow-lg dark:bg-background">
              <form className="p-6 md:p-8" onSubmit={submit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">{t('Welcome back')}</h1>
                    <p className="text-balance text-muted-foreground">
                      {t('Login to your account')}
                    </p>
                  </div>

                  {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                      {status}
                    </div>
                  )}

                  <Field>
                    <FieldLabel htmlFor="email">{t('Email')}</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      placeholder="m@example.com"
                      required
                      disabled={processing}
                      autoComplete="username"
                    />
                    <InputError message={errors.email} className="mt-2" />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">{t('Password')}</FieldLabel>
                      {canResetPassword && (
                        <Link
                          href={route('password.request')}
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          {t('Forgot your password?')}
                        </Link>
                      )}
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                      disabled={processing}
                      autoComplete="current-password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                  </Field>

                  <div className="mt-2 block">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) =>
                          setData('remember', e.target.checked)
                        }
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                      />
                      <span className="ms-2 text-sm text-gray-600">
                        {t('Remember me')}
                      </span>
                    </label>
                  </div>

                  <Field>
                    <Button type="submit" className="w-full" disabled={processing}>
                      {processing ? t('Logging in...') : t('Log in')}
                    </Button>
                  </Field>

                  <FieldDescription className="text-center">
                    {t("Don't have an account?")} <Link href={route('register')} className="underline hover:text-primary">{t('Sign up')}</Link>
                  </FieldDescription>
                </FieldGroup>
              </form>
              <div className="relative hidden bg-muted md:block bg-black">
                <img
                  src="/images/login-bg.png"
                  alt="Login background"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            {t('By clicking continue, you agree to our')} <a href="#">{t('Terms of Service')}</a>{" "}
            {t('and')} <a href="#">{t('Privacy Policy')}</a>.
          </div>
        </div>
      </GuestLayout>
  );
}
