import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Field,
    FieldGroup,
    FieldLabel,
} from '@/Components/ui/field';
import { useTranslation } from "@/lib/i18n";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ConfirmPassword() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('Confirm Password')} />

            <div className="flex flex-col gap-6">
                <Card className="overflow-hidden p-0 shadow-lg dark:bg-card">
                    <CardContent className="grid p-0 md:grid-cols-2 dark:bg-background">
                        <form className="p-6 md:p-8" onSubmit={submit}>
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <h1 className="text-2xl font-bold">{t('Confirm Password')}</h1>
                                    <p className="text-balance text-muted-foreground text-sm">
                                        {t('This is a secure area of the application. Please confirm your password before continuing.')}
                                    </p>
                                </div>

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
                                    />
                                    <InputError message={errors.password} className="mt-2 text-center" />
                                </Field>

                                <Field>
                                    <Button type="submit" disabled={processing} className="w-full">
                                        {processing ? t('Confirming...') : t('Confirm')}
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </form>

                        <div className="relative hidden bg-muted md:block bg-black">
                            <img
                                src="/images/ConfirmPassword.png"
                                alt="Confirm Password background"
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
