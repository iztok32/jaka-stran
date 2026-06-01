import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/Components/ui/badge';
import { Package } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/ui/accordion';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';

interface Permission {
    id: number;
    name: string;
    slug: string;
    module: string;
    is_active: boolean;
    is_assigned: boolean;
}

interface ModulePermissions {
    module: string;
    web_root: string | null;
    description: string | null;
    standard: Permission[];
    custom: Permission[];
    assigned_count: number;
    total_count: number;
}

interface Props {
    roleId: number;
    moduleData: ModulePermissions;
    standardPermissions: string[];
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    canEditRole: boolean;
}

export default function PermissionModuleCard({
    roleId,
    moduleData,
    standardPermissions,
    isOpen,
    onOpenChange,
    canEditRole,
}: Props) {
    const { t } = useTranslation();

    const handleTogglePermission = (permissionId: number) => {
        if (!canEditRole) {
            return; // Don't allow editing if user cannot edit this role
        }

        router.post(route('roles-permissions.toggle'), {
            role_id: roleId,
            permission_id: permissionId,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <Accordion
            type="single"
            collapsible
            className="border rounded-lg"
            value={isOpen ? moduleData.module : ""}
            onValueChange={(value) => onOpenChange(value === moduleData.module)}
        >
            <AccordionItem value={moduleData.module} className="border-none">
                <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-primary" />
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg capitalize">{moduleData.module}</span>
                                    {moduleData.web_root && (
                                        <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                            {moduleData.web_root}
                                        </code>
                                    )}
                                </div>
                                {moduleData.description && (
                                    <span className="text-sm text-muted-foreground font-normal">
                                        {moduleData.description}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Badge
                            variant={moduleData.assigned_count > 0 ? "default" : "secondary"}
                            className="ml-2 shrink-0"
                        >
                            {moduleData.assigned_count}/{moduleData.total_count}
                        </Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                        {/* Standard Permissions */}
                        {moduleData.standard.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    {t('Standard Permissions')}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {standardPermissions.map((action) => {
                                        const permission = moduleData.standard.find(
                                            p => p.slug === `${moduleData.module}.${action}`
                                        );

                                        if (!permission) return null;

                                        return (
                                            <div
                                                key={permission.id}
                                                className="flex items-center space-x-2 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={permission.is_assigned}
                                                    onCheckedChange={() => handleTogglePermission(permission.id)}
                                                    disabled={!permission.is_active || !canEditRole}
                                                />
                                                <Label
                                                    htmlFor={`permission-${permission.id}`}
                                                    className={`text-sm font-medium leading-none cursor-pointer ${
                                                        !permission.is_active ? 'opacity-50' : ''
                                                    }`}
                                                >
                                                    {t(action)}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Custom Permissions */}
                        {moduleData.custom.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                    {t('Custom Permissions')}
                                </h4>
                                <div className="space-y-2">
                                    {moduleData.custom.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={permission.is_assigned}
                                                    onCheckedChange={() => handleTogglePermission(permission.id)}
                                                    disabled={!permission.is_active || !canEditRole}
                                                />
                                                <div className="flex-1">
                                                    <Label
                                                        htmlFor={`permission-${permission.id}`}
                                                        className={`font-medium cursor-pointer ${
                                                            !permission.is_active ? 'opacity-50' : ''
                                                        }`}
                                                    >
                                                        {permission.name}
                                                    </Label>
                                                    <code className="text-xs text-muted-foreground block mt-0.5">
                                                        {permission.slug}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {moduleData.standard.length === 0 && moduleData.custom.length === 0 && (
                            <div className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-md">
                                {t('No permissions available for this module.')}
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
