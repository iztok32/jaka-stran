import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { FormEventHandler } from 'react';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    role?: Role;
    onSuccess: () => void;
}

export default function RolesGroupForm({ role, onSuccess }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: role?.name || '',
        slug: role?.slug || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (role) {
            patch(route('roles-group.update', role.id), {
                onSuccess: () => onSuccess(),
            });
        } else {
            post(route('roles-group.store'), {
                onSuccess: () => {
                    reset();
                    onSuccess();
                },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6 py-4">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('Name')}</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder={t('Administrator')}
                    />
                    {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">{t('Slug')}</Label>
                    <Input
                        id="slug"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        placeholder={t('administrator (leave empty to auto-generate)')}
                    />
                    {errors.slug && <div className="text-sm text-destructive">{errors.slug}</div>}
                    <p className="text-xs text-muted-foreground">
                        {t('Unique identifier for this role. If left empty, it will be automatically generated from the name.')}
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={processing}>
                    {role ? t('Update Role') : t('Create Role')}
                </Button>
            </div>
        </form>
    );
}
