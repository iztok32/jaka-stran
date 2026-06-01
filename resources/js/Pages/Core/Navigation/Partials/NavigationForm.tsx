import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { NavigationItem } from '@/types';
import { FormEventHandler, useState, useEffect } from 'react';

// Since I don't see Select in the provided list, I will use a custom styled select or check if it exists
// Wait, I will use a standard select with tailwind styling for reliability if SHADCN select is missing
// Actually, I'll try to find if there is a Select component in the project.
// If not, I'll use a styled native select.

interface NavigationConfig {
    id: number;
    type: string;
    label: string;
    group: string;
    sort_order: number;
    is_visible: boolean;
}

interface Props {
    item?: NavigationItem;
    items: NavigationItem[];
    configs: NavigationConfig[];
    fixedType?: string;
    onSuccess: () => void;
}

export default function NavigationForm({ item, items, configs, fixedType, onSuccess }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        parent_id: item?.parent_id || null,
        type: item?.type || fixedType || 'main',
        title_key: item?.title_key || '',
        url: item?.url || '',
        icon: item?.icon || '',
        sort_order: item?.sort_order || 0,
        is_active: item?.is_active ?? true,
        permission: item?.permission || '',
        metadata: item?.metadata || {},
    });

    const [metadataString, setMetadataString] = useState(JSON.stringify(item?.metadata || {}, null, 2));

    // Separate state for select value (can be either a number ID or 'config_type')
    const [selectValue, setSelectValue] = useState<string>(() => {
        if (item?.parent_id) {
            return String(item.parent_id);
        }
        return `config_${item?.type || fixedType || 'main'}`;
    });

    useEffect(() => {
        if (!item) {
            setMetadataString('{}');
            setSelectValue(`config_${fixedType || 'main'}`);
        }
    }, [item, fixedType]);

    // Update selectValue when data changes (e.g., when type or parent_id changes programmatically)
    useEffect(() => {
        if (data.parent_id) {
            setSelectValue(String(data.parent_id));
        } else {
            setSelectValue(`config_${data.type}`);
        }
    }, [data.parent_id, data.type]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (item) {
            patch(route('navigation.update', item.id), {
                onSuccess: () => onSuccess(),
            });
        } else {
            post(route('navigation.store'), {
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
                    <Label htmlFor="title_key">{t('Title Key')}</Label>
                    <Input
                        id="title_key"
                        value={data.title_key}
                        onChange={(e) => setData('title_key', e.target.value)}
                        required
                        placeholder="menu.dashboard"
                    />
                    {errors.title_key && <div className="text-sm text-destructive">{errors.title_key}</div>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="url">{t('URL')}</Label>
                    <Input
                        id="url"
                        value={data.url || ''}
                        onChange={(e) => setData('url', e.target.value)}
                        placeholder="/dashboard"
                    />
                    {errors.url && <div className="text-sm text-destructive">{errors.url}</div>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {!fixedType && (
                        <div className="space-y-2">
                            <Label htmlFor="type">{t('Type')}</Label>
                            <select
                                id="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                            >
                                <option value="main">{t('Main Menu')}</option>
                                <option value="header">{t('Header (Glava)')}</option>
                                <option value="settings">{t('Settings (Nastavitveni)')}</option>
                                <option value="users">{t('Users (Uporabnikov)')}</option>
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="parent_id">{t('Parent Item')}</Label>
                        <select
                            id="parent_id"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectValue}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectValue(value);

                                // Check if value is a config type (starts with 'config_')
                                if (value.startsWith('config_')) {
                                    const configType = value.replace('config_', '');
                                    // Always update type when selecting top-level config
                                    setData({
                                        ...data,
                                        parent_id: null,
                                        type: configType,
                                    });
                                } else {
                                    const selectedId = value ? parseInt(value) : null;

                                    // Auto-change type to match parent's type
                                    if (selectedId) {
                                        const selectedParent = items.find(i => i.id === selectedId);
                                        if (selectedParent) {
                                            // Always update type to match parent's type
                                            setData({
                                                ...data,
                                                parent_id: selectedId,
                                                type: selectedParent.type,
                                            });
                                        } else {
                                            setData('parent_id', selectedId);
                                        }
                                    } else {
                                        setData('parent_id', null);
                                    }
                                }
                            }}
                        >
                            {/* Only show main and settings types */}
                            {['main', 'settings'].map(type => {
                                const config = configs.find(c => c.type === type);

                                // Recursively flatten all items of this type (including nested children)
                                const flattenItems = (itemsList: NavigationItem[], level = 0): Array<{ item: NavigationItem, level: number }> => {
                                    let result: Array<{ item: NavigationItem, level: number }> = [];
                                    itemsList.forEach(i => {
                                        // Skip the current editing item
                                        if (i.id === item?.id) return;

                                        // Add item if it matches the type
                                        if (i.type === type) {
                                            result.push({ item: i, level });
                                        }

                                        // Recursively process children
                                        if (i.children && i.children.length > 0) {
                                            const childResults = flattenItems(i.children, i.type === type ? level + 1 : level);
                                            result = result.concat(childResults);
                                        }
                                    });
                                    return result;
                                };

                                const flatItems = flattenItems(items);

                                return (
                                    <optgroup key={type} label="───────────────">
                                        {/* Top level option for this type */}
                                        <option value={`config_${type}`} style={{ fontWeight: 'bold' }}>
                                            {config ? t(config.label) : t('Top Level')}
                                        </option>

                                        {/* All items of this type (with indentation for children) */}
                                        {flatItems.map(({ item: i, level }) => (
                                            <option key={i.id} value={i.id}>
                                                {'\u00A0\u00A0'.repeat(level * 2)}{t(i.title_key)}
                                            </option>
                                        ))}
                                    </optgroup>
                                );
                            })}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            {t('Selecting a parent will automatically change the type to match')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="icon">{t('Icon')}</Label>
                        <Input
                            id="icon"
                            value={data.icon || ''}
                            onChange={(e) => setData('icon', e.target.value)}
                            placeholder="layout-dashboard"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sort_order">{t('Sort Order')}</Label>
                        <Input
                            id="sort_order"
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="permission">{t('Permission Required')}</Label>
                    <Input
                        id="permission"
                        value={data.permission || ''}
                        onChange={(e) => setData('permission', e.target.value)}
                        placeholder="admin.access"
                    />
                </div>

                <div className="space-y-4 border-t pt-4">
                    <Label className="text-sm font-bold">{t('Metadata Settings')}</Label>
                    
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="meta_is_logo"
                            checked={data.metadata?.is_logo || false}
                            onCheckedChange={(checked) => setData('metadata', { ...data.metadata, is_logo: checked })}
                        />
                        <Label htmlFor="meta_is_logo">{t('Use as Logo (No Background)')}</Label>
                    </div>

                    {(data.type === 'header' || data.type === 'team') && (
                        <div className="space-y-2">
                            <Label htmlFor="meta_plan">{t('Plan (Team)')}</Label>
                            <Input
                                id="meta_plan"
                                value={data.metadata?.plan || ''}
                                onChange={(e) => setData('metadata', { ...data.metadata, plan: e.target.value })}
                                placeholder="Free, Pro, Enterprise"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="metadata_raw">{t('Custom Metadata (JSON)')}</Label>
                        <textarea
                            id="metadata_raw"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                            value={metadataString}
                            onChange={(e) => {
                                setMetadataString(e.target.value);
                                try {
                                    setData('metadata', JSON.parse(e.target.value));
                                } catch (err) {
                                    // Silent catch while typing invalid JSON
                                }
                            }}
                            placeholder="{}"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_active"
                        checked={data.is_active}
                        onCheckedChange={(checked) => setData('is_active', checked)}
                    />
                    <Label htmlFor="is_active">{t('Active')}</Label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={processing}>
                    {item ? t('Update Item') : t('Create Item')}
                </Button>
            </div>
        </form>
    );
}
