import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { useTranslation } from "@/lib/i18n";
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { CheckCircle2 } from 'lucide-react';

export default function UpdatePasswordForm() {
    const { t } = useTranslation();
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('Update Password')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('Ensure your account is using a long, random password to stay secure.')}
                </p>
            </div>

            <form onSubmit={updatePassword} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current_password">{t('Current Password')}</Label>
                    <Input
                        id="current_password"
                        ref={currentPasswordInput}
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                    />
                    {errors.current_password && (
                        <p className="text-sm text-destructive">{errors.current_password}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">{t('New Password')}</Label>
                    <Input
                        id="password"
                        ref={passwordInput}
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                    />
                    {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">{t('Confirm Password')}</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                    />
                    {errors.password_confirmation && (
                        <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                    )}
                </div>

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
            </form>
        </div>
    );
}
