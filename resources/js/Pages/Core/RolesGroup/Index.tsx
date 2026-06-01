import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableRoleRow from './Partials/SortableRoleRow';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import RolesGroupForm from './Partials/RolesGroupForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface Role {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
    created_by_role_id: number | null;
    created_by_role?: Role;
    created_roles?: Role[];
    visible_roles?: Role[];
    display_order: number;
}

interface Props {
    roles: Role[];
    userRoles: Role[];
}

export default function Index({ roles, userRoles }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage<PageProps>().props;
    const userPermissions = auth.user?.permissions || [];

    // Check permissions
    const canCreate = userPermissions.includes('roles-group.create');
    const canEdit = userPermissions.includes('roles-group.edit');
    const canDelete = userPermissions.includes('roles-group.delete');

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
    const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);
    const [managingVisibilityRole, setManagingVisibilityRole] = useState<Role | null>(null);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [localRoles, setLocalRoles] = useState<Role[]>(roles);
    const [searchQuery, setSearchQuery] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleCreate = () => {
        setEditingRole(undefined);
        setIsSheetOpen(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setIsSheetOpen(true);
    };

    const handleDelete = (id: number) => {
        setRoleToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (roleToDelete) {
            router.delete(route('roles-group.destroy', roleToDelete), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setRoleToDelete(null);
                },
            });
        }
    };

    const handleManageVisibility = async (role: Role) => {
        setManagingVisibilityRole(role);
        setIsVisibilityDialogOpen(true);

        // Fetch available roles
        try {
            const response = await fetch(route('roles-group.available-roles', role.id));
            const data = await response.json();
            setAvailableRoles(data);
        } catch (error) {
            console.error('Failed to fetch available roles:', error);
        }
    };

    const handleGrantVisibility = async (canSeeRoleId: number) => {
        if (!managingVisibilityRole) return;

        router.post(route('roles-group.grant-visibility'), {
            role_id: managingVisibilityRole.id,
            can_see_role_id: canSeeRoleId,
        }, {
            preserveScroll: true,
            preserveState: false, // Force reload to get fresh data
            onSuccess: async () => {
                // Wait a bit for Inertia to reload, then refresh the dialog
                setTimeout(async () => {
                    const updatedRole = roles.find(r => r.id === managingVisibilityRole.id);
                    if (updatedRole) {
                        setManagingVisibilityRole(updatedRole);
                    }

                    // Fetch fresh available roles
                    try {
                        const response = await fetch(route('roles-group.available-roles', managingVisibilityRole.id));
                        const data = await response.json();
                        setAvailableRoles(data);
                    } catch (error) {
                        console.error('Failed to refresh available roles:', error);
                    }
                }, 100);
            },
        });
    };

    const handleRevokeVisibility = async (canSeeRoleId: number) => {
        if (!managingVisibilityRole) return;

        router.post(route('roles-group.revoke-visibility'), {
            role_id: managingVisibilityRole.id,
            can_see_role_id: canSeeRoleId,
        }, {
            preserveScroll: true,
            preserveState: false, // Force reload to get fresh data
            onSuccess: async () => {
                // Wait a bit for Inertia to reload, then refresh the dialog
                setTimeout(async () => {
                    const updatedRole = roles.find(r => r.id === managingVisibilityRole.id);
                    if (updatedRole) {
                        setManagingVisibilityRole(updatedRole);
                    }

                    // Fetch fresh available roles
                    try {
                        const response = await fetch(route('roles-group.available-roles', managingVisibilityRole.id));
                        const data = await response.json();
                        setAvailableRoles(data);
                    } catch (error) {
                        console.error('Failed to refresh available roles:', error);
                    }
                }, 100);
            },
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = localRoles.findIndex((role) => role.id === active.id);
        const newIndex = localRoles.findIndex((role) => role.id === over.id);

        const newRoles = arrayMove(localRoles, oldIndex, newIndex);
        setLocalRoles(newRoles);

        // Update display_order for all roles
        const items = newRoles.map((role, index) => ({
            id: role.id,
            display_order: index,
        }));

        router.post(route('roles-group.reorder'), { items }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // Filter roles based on search query
    const filteredRoles = localRoles.filter(role => {
        const query = searchQuery.toLowerCase();
        return (
            role.name.toLowerCase().includes(query) ||
            role.slug.toLowerCase().includes(query)
        );
    });

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Roles Management')}
                </h2>
            }
        >
            <Head title={t('Roles')} />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>{t('Roles Groups')}</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('Search roles...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 w-64"
                            />
                        </div>
                        {canCreate && (
                            <Button onClick={handleCreate} size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t('Add New Role')}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8"></TableHead>
                                <TableHead>{t('Name')}</TableHead>
                                <TableHead>{t('Slug')}</TableHead>
                                <TableHead>{t('Parent Role')}</TableHead>
                                <TableHead>{t('Visible Roles')}</TableHead>
                                <TableHead className="w-[180px] text-right">{t('Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={filteredRoles.map((r) => r.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {filteredRoles.length > 0 ? (
                                        filteredRoles.map((role) => (
                                            <SortableRoleRow key={role.id} id={role.id}>
                                                <TableCell className="font-medium">{role.name}</TableCell>
                                                <TableCell>
                                                    <code className="px-2 py-1 bg-muted rounded text-sm">
                                                        {role.slug}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    {role.created_by_role ? (
                                                        <span className="text-sm text-muted-foreground">
                                                            {role.created_by_role.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">
                                                            {t('Superadmin')}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">
                                                        {role.visible_roles && role.visible_roles.length > 0 ? (
                                                            <span>{role.visible_roles.length} {t('roles')}</span>
                                                        ) : (
                                                            <span>{t('None')}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {canEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleManageVisibility(role)}
                                                                className="h-8 w-8"
                                                                title={t('Manage Visibility')}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {canEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(role)}
                                                                className="h-8 w-8"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {canDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(role.id)}
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {!canEdit && !canDelete && (
                                                            <span className="text-muted-foreground text-sm">
                                                                {t('No actions available')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </SortableRoleRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                {t('No roles found.')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </SortableContext>
                            </DndContext>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-[500px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingRole ? t('Edit Role') : t('Add New Role')}</SheetTitle>
                        <SheetDescription>
                            {t('Configure your user role here. Click save when you\'re done.')}
                        </SheetDescription>
                    </SheetHeader>
                    <RolesGroupForm
                        role={editingRole}
                        onSuccess={() => setIsSheetOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Confirm Delete')}</DialogTitle>
                        <DialogDescription>
                            {t('Are you sure you want to delete this role? This action cannot be undone.')}
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

            <Dialog open={isVisibilityDialogOpen} onOpenChange={setIsVisibilityDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {t('Manage Visibility')} - {managingVisibilityRole?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {t('Grant or revoke visibility of other roles to this role.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {managingVisibilityRole && (
                            <>
                                <div>
                                    <h4 className="font-semibold mb-2">{t('Currently Visible Roles')}</h4>
                                    {managingVisibilityRole.visible_roles && managingVisibilityRole.visible_roles.length > 0 ? (
                                        <div className="space-y-2">
                                            {managingVisibilityRole.visible_roles.map((visibleRole) => (
                                                <div key={visibleRole.id} className="flex items-center justify-between p-2 border rounded">
                                                    <span>{visibleRole.name}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRevokeVisibility(visibleRole.id)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <EyeOff className="h-4 w-4 mr-1" />
                                                        {t('Revoke')}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">{t('No additional visible roles.')}</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">{t('Available Roles to Grant')}</h4>
                                    {availableRoles.length > 0 ? (
                                        <div className="space-y-2">
                                            {availableRoles.map((availableRole) => (
                                                <div key={availableRole.id} className="flex items-center justify-between p-2 border rounded">
                                                    <span>{availableRole.name}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleGrantVisibility(availableRole.id)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        {t('Grant')}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">{t('No additional roles available to grant.')}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsVisibilityDialogOpen(false)}>
                            {t('Close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
