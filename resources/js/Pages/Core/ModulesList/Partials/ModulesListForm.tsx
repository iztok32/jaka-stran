import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { FormEventHandler } from 'react';

interface Module {
    id: number;
    name: string;
    web_root: string | null;
    description: string | null;
}

interface Props {
    module?: Module;
    onSuccess: () => void;
}

export default function ModulesListForm({ module, onSuccess }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: module?.name || '',
        web_root: module?.web_root || '',
        description: module?.description || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (module) {
            patch(route('modules-list.update', module.id), {
                onSuccess: () => onSuccess(),
            });
        } else {
            post(route('modules-list.store'), {
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
                    <Label htmlFor="name">{t('Module Name')}</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value.toLowerCase())}
                        required
                        placeholder={t('users')}
                        className="lowercase font-mono"
                    />
                    {errors.name && <div className="text-sm text-destructive">{errors.name}</div>}
                    <p className="text-xs text-muted-foreground">
                        {t('Unique identifier for this module (lowercase, no spaces).')}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="web_root">{t('Web Root')}</Label>
                    <Input
                        id="web_root"
                        value={data.web_root}
                        onChange={(e) => setData('web_root', e.target.value)}
                        placeholder={t('/users')}
                        className="font-mono text-sm"
                    />
                    {errors.web_root && <div className="text-sm text-destructive">{errors.web_root}</div>}
                    <p className="text-xs text-muted-foreground">
                        {t('The URL path where this module is accessible (e.g., /users, /roles-group).')}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">{t('Description')}</Label>
                    <textarea
                        id="description"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder={t('Describe what this module does...')}
                    />
                    {errors.description && <div className="text-sm text-destructive">{errors.description}</div>}
                    <p className="text-xs text-muted-foreground">
                        {t('Optional description of what this module is responsible for.')}
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="submit" disabled={processing}>
                    {module ? t('Update Module') : t('Create Module')}
                </Button>
            </div>
        </form>
    );
}
