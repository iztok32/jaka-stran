import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Plus, Edit2, Trash2, Package, Check, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/ui/accordion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { useState } from 'react';

interface Permission {
    id: number;
    name: string;
    slug: string;
    module: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ModulePermissions {
    module: string;
    web_root: string | null;
    description: string | null;
    standard: Permission[];
    custom: Permission[];
}

interface Props {
    moduleData: ModulePermissions;
    standardPermissions: string[];
    onEdit: (permission: Permission) => void;
    onAddCustom: (module: string) => void;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function PermissionCard({ moduleData, standardPermissions, onEdit, onAddCustom, isOpen, onOpenChange }: Props) {
    const { t } = useTranslation();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setPermissionToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (permissionToDelete) {
            router.delete(route('permissions.destroy', permissionToDelete), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setPermissionToDelete(null);
                },
            });
        }
    };

    const handleToggleStandard = (action: string) => {
        router.post(route('permissions.toggleStandard'), {
            module: moduleData.module,
            action: action,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
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
                            <Badge variant="secondary" className="ml-2 shrink-0">
                                {moduleData.custom.length} {t('custom')}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <div className="space-y-6">
                            {/* Standard Permissions */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t('Standard Permissions')}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {standardPermissions.map((action) => {
                                        const permission = moduleData.standard.find(
                                            p => p.slug === `${moduleData.module}.${action}`
                                        );
                                        const exists = !!permission;
                                        const isActive = permission?.is_active ?? false;

                                        return (
                                            <div
                                                key={action}
                                                onClick={() => handleToggleStandard(action)}
                                                className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {exists && isActive ? (
                                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20">
                                                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                    ) : exists && !isActive ? (
                                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20">
                                                            <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted">
                                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium capitalize">
                                                        {t(action)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Permissions */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t('Custom Permissions')}
                                    </h4>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onAddCustom(moduleData.module)}
                                        className="gap-2"
                                    >
                                        <Plus className="h-3 w-3" />
                                        {t('Add Custom')}
                                    </Button>
                                </div>

                                {moduleData.custom.length > 0 ? (
                                    <div className="space-y-2">
                                        {moduleData.custom.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">{permission.name}</div>
                                                    <code className="text-xs text-muted-foreground">
                                                        {permission.slug}
                                                    </code>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit(permission)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(permission.id)}
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-md">
                                        {t('No custom permissions for this module yet.')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Confirm Delete')}</DialogTitle>
                        <DialogDescription>
                            {t('Are you sure you want to delete this permission? This action cannot be undone.')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            {t('Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
