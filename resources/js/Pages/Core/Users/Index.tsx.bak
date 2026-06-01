import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Plus, Edit2, Trash2, Mail, Check, X } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
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
import { Badge } from '@/Components/ui/badge';
import UserForm from './Partials/UserForm';

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: string[];
    created_at: string;
    deleted_at: string | null;
}

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    users: User[];
    roles: Role[];
}

export default function Index({ users, roles }: Props) {
    const { t } = useTranslation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const handleCreate = () => {
        setEditingUser(undefined);
        setIsSheetOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsSheetOpen(true);
    };

    const handleCloseSheet = () => {
        setIsSheetOpen(false);
        setEditingUser(undefined);
    };

    const handleDelete = (id: number) => {
        setUserToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route('users.destroy', userToDelete), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    const handleSendPasswordReset = (userId: number) => {
        router.post(route('users.send-password-reset'), {
            user_id: userId,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Users Management')}
                </h2>
            }
        >
            <Head title={t('Users Management')} />

            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>{t('Users')}</CardTitle>
                        <Button onClick={handleCreate} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('Add User')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Name')}</TableHead>
                                    <TableHead>{t('Email')}</TableHead>
                                    <TableHead>{t('Status')}</TableHead>
                                    <TableHead>{t('Roles')}</TableHead>
                                    <TableHead className="text-right">{t('Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user.id} className={user.deleted_at ? 'opacity-50' : ''}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {user.deleted_at ? (
                                                        <Badge variant="destructive">{t('Deleted')}</Badge>
                                                    ) : user.is_active ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <Check className="h-3 w-3" />
                                                            {t('Active')}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <X className="h-3 w-3" />
                                                            {t('Inactive')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role, index) => (
                                                        <Badge key={index} variant="outline">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleSendPasswordReset(user.id)}
                                                        title={t('Send Password Reset Link')}
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            {t('No users found.')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingUser ? t('Edit User') : t('Add User')}
                        </SheetTitle>
                        <SheetDescription>
                            {editingUser ? t('Update user information') : t('Create a new user. Password reset link will be sent to the email.')}
                        </SheetDescription>
                    </SheetHeader>
                    <UserForm
                        user={editingUser}
                        roles={roles}
                        onClose={handleCloseSheet}
                    />
                </SheetContent>
            </Sheet>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Confirm Delete')}</DialogTitle>
                        <DialogDescription>
                            {t('Are you sure you want to delete this user? This action cannot be undone.')}
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
        </AuthenticatedLayout>
    );
}
