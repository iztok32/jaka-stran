import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from "@/lib/i18n";
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CheckCircle2, Eye } from 'lucide-react';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    canEdit: boolean;
}

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    canEdit,
}: Props) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            gsm_number: user.gsm_number || '',
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canEdit) {
            patch(route('profile.update'));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                    {canEdit ? t('Profile Information') : (
                        <>
                            <Eye className="h-5 w-5" />
                            {t('Profile Information')} ({t('Read Only')})
                        </>
                    )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {canEdit
                        ? t("Update your account's profile information and email address.")
                        : t("View your account's profile information and email address.")
                    }
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('Name')}</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                        disabled={!canEdit}
                        readOnly={!canEdit}
                        className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">{t('Email')}</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        disabled={!canEdit}
                        readOnly={!canEdit}
                        className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gsm_number">{t('GSM Number')}</Label>
                    <Input
                        id="gsm_number"
                        type="tel"
                        value={data.gsm_number}
                        onChange={(e) => setData('gsm_number', e.target.value)}
                        placeholder="+386 XX XXX XXX"
                        autoComplete="tel"
                        disabled={!canEdit}
                        readOnly={!canEdit}
                        className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                    />
                    {errors.gsm_number && (
                        <p className="text-sm text-destructive">{errors.gsm_number}</p>
                    )}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <Alert>
                        <AlertDescription>
                            {t('Your email address is unverified.')}{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline hover:no-underline"
                            >
                                {t('Click here to re-send the verification email.')}
                            </Link>
                        </AlertDescription>
                        {status === 'verification-link-sent' && (
                            <AlertDescription className="mt-2 font-medium text-green-600">
                                {t('A new verification link has been sent to your email address.')}
                            </AlertDescription>
                        )}
                    </Alert>
                )}

                {canEdit && (
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {t('Save')}
                        </Button>

                        {recentlySuccessful && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span>{t('Saved.')}</span>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}
