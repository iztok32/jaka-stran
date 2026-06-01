import { useTranslation } from '@/lib/i18n';
import { IconMapper } from '@/lib/icon-mapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Switch } from '@/Components/ui/switch';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

interface NavigationItem {
    id: number;
    title_key: string;
    url: string | null;
    icon: string | null;
    allowed_roles: string[] | null;
    children?: NavigationItem[];
}

interface NavigationBlock {
    type: string;
    group: string;
    label: string;
    items: NavigationItem[];
}

interface Props {
    navigationPreview: {
        configs: Record<string, string>;
        blocks: NavigationBlock[];
    } | null;
    roleSlug: string | null;
    selectedModuleWebRoot?: string;
    onModuleClick?: (webRoot: string) => void;
    canEditRole?: boolean;
}

export default function SidebarPreview({ navigationPreview, roleSlug, selectedModuleWebRoot, onModuleClick, canEditRole = true }: Props) {
    const { t } = useTranslation();
    const [expandedItems, setExpandedItems] = useState<number[]>([]);

    if (!navigationPreview) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('Sidebar Preview')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        {t('Select a role to preview sidebar')}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const mainBlocks = navigationPreview.blocks.filter(b => b.group === 'main');
    const settingsBlocks = navigationPreview.blocks.filter(b => b.group === 'settings');

    const toggleExpand = (itemId: number) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleToggleVisibility = (navigationItemId: number) => {
        if (!roleSlug) return;

        router.post(route('roles-permissions.toggle-navigation'), {
            role_slug: roleSlug,
            navigation_item_id: navigationItemId,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const isItemVisibleForRole = (item: NavigationItem): boolean => {
        if (!roleSlug) return true;
        // If allowed_roles is null, it's visible to everyone
        if (!item.allowed_roles) return true;
        // Check if role slug is in allowed_roles array
        return item.allowed_roles.includes(roleSlug);
    };

    const renderNavigationItem = (item: NavigationItem, isChild = false) => {
        const Icon = item.icon ? IconMapper(item.icon) : null;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const itemUrl = item.url ? item.url.replace(/^\//, '') : '';
        const isSelected = selectedModuleWebRoot && itemUrl === selectedModuleWebRoot;
        const isVisible = isItemVisibleForRole(item);

        return (
            <div key={item.id} className={cn(isChild && 'ml-4')}>
                <div
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                        'cursor-pointer hover:bg-accent hover:text-accent-foreground',
                        isSelected && 'bg-accent text-accent-foreground font-medium',
                        isChild && 'text-sm'
                    )}
                    onClick={() => {
                        if (hasChildren) {
                            toggleExpand(item.id);
                        }
                        if (item.url && onModuleClick) {
                            onModuleClick(itemUrl);
                        }
                    }}
                >
                    {hasChildren && (
                        <ChevronRight
                            className={cn(
                                'h-4 w-4 transition-transform',
                                isExpanded && 'rotate-90'
                            )}
                        />
                    )}
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="flex-1">{t(item.title_key || '')}</span>

                    {/* Toggle switch for visibility - show for all levels */}
                    {canEditRole && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <Switch
                                checked={isVisible}
                                onCheckedChange={() => handleToggleVisibility(item.id)}
                                className="ml-2"
                            />
                        </div>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div className="mt-1">
                        {item.children!.map(child => renderNavigationItem(child, true))}
                    </div>
                )}
            </div>
        );
    };

    const renderBlock = (block: NavigationBlock) => {
        if (block.items.length === 0) return null;

        return (
            <div key={block.type} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {navigationPreview.configs[block.type] || t(block.label)}
                </div>
                <div className="space-y-1">
                    {block.items.map(item => renderNavigationItem(item))}
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('Sidebar Preview')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {t('This is how the sidebar will look for this role')}
                </p>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4 bg-sidebar text-sidebar-foreground min-h-[400px]">
                    {mainBlocks.map(renderBlock)}
                    {settingsBlocks.map(renderBlock)}
                    {mainBlocks.length === 0 && settingsBlocks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('No navigation items visible for this role')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
