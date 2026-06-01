import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { FormEventHandler } from 'react';

interface Permission {
    id: number;
    name: string;
    slug: string;
    module: string;
}

interface Props {
    permission?: Permission;
    selectedModule?: string;
    allModules: string[];
    onSuccess: () => void;
}

export default function PermissionForm({ permission, selectedModule, allModules, onSuccess }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        module: permission?.module || selectedModule || '',
        name: permission?.name || '',
        slug: permission?.slug || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (permission) {
            patch(route('permissions.update', permission.id), {
                onSuccess: () => onSuccess(),
            });
        } else {
            post(route('permissions.store'), {
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
                    <Label htmlFor="module">{t('Module')}</Label>
                    {selectedModule ? (
                        <Input
                            id="module"
                            value={data.module}
                            disabled
                            className="capitalize"
                        />
                    ) : (
                        <>
                            <Input
                                id="module"
                                value={data.module}
                                onChange={(e) => setData('module', e.target.value.toLowerCase())}
                                required
                                placeholder={t('users, roles, etc.')}
                                className="lowercase"
                                list="modules-list"
                            />
                            <datalist id="modules-list">
                                {allModules.map((module) => (
                                    <option key={module} value={module} />
                                ))}
                            </datalist>
                        </>
                    )}
                    {errors.module && <div className="text-sm text-destructive">{errors.module}</div>}
                    <p className="text-xs text-muted-foreground">
                        {t('The module this permission belongs to (e.g., users, roles, posts).')}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">{t('Permission Name')}</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder={t('Export Users')}
                    />
                    {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
                    <p className="text-xs text-muted-foreground">
                        {t('A human-readable name for this permission.')}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">{t('Slug (Optional)')}</Label>
                    <Input
                        id="slug"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value.toLowerCase())}
                        placeholder={t('users.export (leave empty to auto-generate)')}
                        className="lowercase font-mono text-sm"
                    />
                    {errors.slug && <div className="text-sm text-destructive">{errors.slug}</div>}
                    <p className="text-xs text-muted-foreground">
                        {t('Unique identifier for this permission. If left empty, it will be automatically generated.')}
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="submit" disabled={processing}>
                    {permission ? t('Update Permission') : t('Create Permission')}
                </Button>
            </div>
        </form>
    );
}
