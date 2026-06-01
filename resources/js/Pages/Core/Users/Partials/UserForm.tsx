import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    gsm_number?: string;
    is_active: boolean;
    roles: string[];
}

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    user?: User;
    roles: Role[];
    onClose: () => void;
}

export default function UserForm({ user, roles, onClose }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, put, errors, processing, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        gsm_number: user?.gsm_number || '',
        is_active: user?.is_active ?? true,
        role_id: null as number | null,
    });

    // Load user role on edit
    useEffect(() => {
        if (user && user.roles.length > 0) {
            // Find the first role ID that matches user's role
            const userRole = roles.find(role => user.roles.includes(role.name));
            if (userRole) {
                setData('role_id', userRole.id);
            }
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            put(route('users.update', user.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
                <Label htmlFor="name">{t('Name')}</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
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
                />
                {errors.gsm_number && (
                    <p className="text-sm text-destructive">{errors.gsm_number}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">{t('Role')}</Label>
                <Select
                    value={data.role_id?.toString()}
                    onValueChange={(value) => setData('role_id', parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('Select a role')} />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.role_id && (
                    <p className="text-sm text-destructive">{errors.role_id}</p>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                    {t('Active')}
                </Label>
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                    {t('Cancel')}
                </Button>
                <Button type="submit" disabled={processing}>
                    {user ? t('Update') : t('Create')}
                </Button>
            </div>
        </form>
    );
}
