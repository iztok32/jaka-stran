import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Field,
    FieldDescription,
    FieldGroup,
} from '@/Components/ui/field';
import { useTranslation } from "@/lib/i18n";
import GuestLayout from "@/Layouts/GuestLayout";

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('Email Verification')} />

            <div className="flex flex-col gap-6">
                <Card className="overflow-hidden p-0 shadow-lg dark:bg-card">
                    <CardContent className="grid p-0 md:grid-cols-2 dark:bg-background">
                        <form className="p-6 md:p-8" onSubmit={submit}>
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <h1 className="text-2xl font-bold">{t('Verify Email')}</h1>
                                    <p className="text-balance text-muted-foreground text-sm">
                                        {t("Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.")}
                                    </p>
                                </div>

                                {status === 'verification-link-sent' && (
                                    <div className="rounded-lg bg-green-50s border border-green-200 p-4 text-center text-sm text-green-600 font-medium">
                                        {t('A new verification link has been sent to the email address you provided during registration.')}
                                    </div>
                                )}

                                <Field>
                                    <Button type="submit" disabled={processing} className="w-full">
                                        {processing ? t('Sending...') : t('Resend Verification Email')}
                                    </Button>
                                </Field>

                                <FieldDescription className="text-center mt-4">
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button"
                                        className="underline underline-offset-4 hover:text-primary"
                                    >
                                        {t('Log Out')}
                                    </Link>
                                </FieldDescription>
                            </FieldGroup>
                        </form>

                        <div className="relative hidden bg-muted md:block bg-black">
                            <img
                                src="/images/VerifyEmail.png"
                                alt="Verify Email background"
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
