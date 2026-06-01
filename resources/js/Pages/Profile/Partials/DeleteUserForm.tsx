import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { useTranslation } from "@/lib/i18n";
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

export default function DeleteUserForm() {
    const { t } = useTranslation();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('Delete Account')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.')}
                </p>
            </div>

            <Button variant="destructive" onClick={confirmUserDeletion}>
                {t('Delete Account')}
            </Button>

            <Dialog open={confirmingUserDeletion} onOpenChange={setConfirmingUserDeletion}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Are you sure you want to delete your account?')}</DialogTitle>
                        <DialogDescription>
                            {t('Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={deleteUser}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="sr-only">{t('Password')}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={t('Password')}
                                    autoFocus
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="ghost" onClick={closeModal}>
                                {t('Cancel')}
                            </Button>
                            <Button type="submit" variant="destructive" disabled={processing}>
                                {t('Delete Account')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
