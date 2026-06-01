import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/Components/ui/field';
import { useTranslation } from "@/lib/i18n";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ResetPassword({ token, email }: { token: string, email: string }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('Reset Password')} />
            <div className="flex flex-col gap-6">
                <Card className="overflow-hidden p-0 shadow-lg dark:bg-card">
                    <CardContent className="grid p-0 md:grid-cols-2 dark:bg-background">
                        <form className="p-6 md:p-8" onSubmit={submit}>
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <h1 className="text-2xl font-bold">{t('Create New Password')}</h1>
                                    <p className="text-balance text-muted-foreground text-sm">
                                        {t('Your new password must be different from previously used passwords.')}
                                    </p>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="email">{t('Email')}</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        disabled={processing}
                                        autoComplete="username"
                                    />
                                    <InputError message={errors.email} className="mt-2 text-center" />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="password">{t('Password')}</FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        disabled={processing}
                                        autoComplete="new-password"
                                    />
                                    <FieldDescription>{t('Must be at least 8 characters long.')}</FieldDescription>
                                    <InputError message={errors.password} className="mt-2 text-center" />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="password_confirmation">{t('Confirm Password')}</FieldLabel>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                        disabled={processing}
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2 text-center" />
                                </Field>

                                <Field>
                                    <Button type="submit" disabled={processing} className="w-full">
                                        {processing ? t('Resetting password...') : t('Reset Password')}
                                    </Button>
                                </Field>
                                
                                <FieldDescription className="text-center mt-4">
                                    <Link href={route('login')} className="underline underline-offset-4 hover:text-primary">
                                        {t('Back to login')}
                                    </Link>
                                </FieldDescription>
                            </FieldGroup>
                        </form>

                        <div className="relative hidden bg-muted md:block bg-black">
                            <img
                                src="/images/reset-password-bg.png"
                                alt="Reset password background"
                                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="px-6 text-center text-sm text-balance text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                    {t('By clicking continue, you agree to our')} <a href="#">{t('Terms of Service')}</a>{' '}
                    {t('and')} <a href="#">{t('Privacy Policy')}</a>.
                </div>
            </div>
        </GuestLayout>
    );
}
