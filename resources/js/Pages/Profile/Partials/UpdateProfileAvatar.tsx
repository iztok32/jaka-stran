import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from "@/lib/i18n";
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { useState, useRef } from 'react';

interface Props {
    canEdit: boolean;
}

export default function UpdateProfileAvatar({ canEdit }: Props) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.avatar ? `/storage/${user.avatar}` : null
    );

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            avatar: null as File | null,
            _method: 'patch',
        });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setData('avatar', null);
        setAvatarPreview(user.avatar ? `/storage/${user.avatar}` : null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canEdit && data.avatar) {
            post(route('profile.update'), {
                forceFormData: true,
                onSuccess: () => {
                    // Reset file input after successful upload
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">
                    {t('Profile Picture')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('Update your profile picture')}
                </p>
            </div>

            <div className="flex flex-col items-center gap-6">
                <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview || undefined} alt={user.name} />
                    <AvatarFallback className="text-4xl">
                        {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {canEdit && (
                    <div className="flex flex-col gap-3 w-full">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            id="avatar-upload"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-2 w-full"
                        >
                            <Upload className="h-4 w-4" />
                            {t('Choose Photo')}
                        </Button>

                        {data.avatar && (
                            <>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="gap-2 w-full"
                                    disabled={processing}
                                >
                                    {t('Upload Photo')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeAvatar}
                                    className="gap-2 text-destructive hover:text-destructive w-full"
                                >
                                    <X className="h-4 w-4" />
                                    {t('Cancel')}
                                </Button>
                            </>
                        )}

                        <p className="text-xs text-muted-foreground text-center">
                            {t('JPG, PNG or GIF (max. 2MB)')}
                        </p>

                        {recentlySuccessful && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span>{t('Saved.')}</span>
                            </div>
                        )}
                    </div>
                )}

                {errors.avatar && (
                    <p className="text-sm text-destructive">{errors.avatar}</p>
                )}
            </div>
        </form>
    );
}
