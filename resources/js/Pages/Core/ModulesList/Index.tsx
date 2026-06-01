import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
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
import { Plus, Edit2, Trash2, Package, Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
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
import ModulesListForm from './Partials/ModulesListForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface Module {
    id: number;
    name: string;
    web_root: string | null;
    description: string | null;
    permissions_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    modules: Module[];
    filters: {
        search: string;
    };
}

export default function Index({ modules, filters }: Props) {
    const { t } = useTranslation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | undefined>(undefined);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const handleCreate = () => {
        setEditingModule(undefined);
        setIsSheetOpen(true);
    };

    const handleEdit = (module: Module) => {
        setEditingModule(module);
        setIsSheetOpen(true);
    };

    const handleDelete = (id: number) => {
        setModuleToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (moduleToDelete) {
            router.delete(route('modules-list.destroy', moduleToDelete), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setModuleToDelete(null);
                },
            });
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(route('modules-list.index'), { search: value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Modules Management')}
                </h2>
            }
        >
            <Head title={t('Modules')} />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>{t('System Modules')}</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={t('Search modules...')}
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-8 w-[250px]"
                            />
                        </div>
                        <Button onClick={handleCreate} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('Add New Module')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('Module Name')}</TableHead>
                                <TableHead>{t('Web Root')}</TableHead>
                                <TableHead>{t('Description')}</TableHead>
                                <TableHead className="w-[100px]">{t('Permissions')}</TableHead>
                                <TableHead className="w-[120px] text-right">{t('Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modules.length > 0 ? (
                                modules.map((module) => (
                                    <TableRow key={module.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-primary" />
                                                <code className="px-2 py-1 bg-muted rounded text-sm">
                                                    {module.name}
                                                </code>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {module.web_root ? (
                                                <code className="text-sm text-muted-foreground">
                                                    {module.web_root}
                                                </code>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">
                                                    {t('Not specified')}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            {module.description ? (
                                                <span className="text-sm line-clamp-2">
                                                    {module.description}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">
                                                    {t('No description')}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {module.permissions_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(module)}
                                                    className="h-8 w-8"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(module.id)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
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
                                        {t('No modules found.')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-[500px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingModule ? t('Edit Module') : t('Add New Module')}</SheetTitle>
                        <SheetDescription>
                            {t('Configure your module here. Click save when you\'re done.')}
                        </SheetDescription>
                    </SheetHeader>
                    <ModulesListForm
                        module={editingModule}
                        onSuccess={() => setIsSheetOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Confirm Delete')}</DialogTitle>
                        <DialogDescription>
                            {t('Are you sure you want to delete this module? This action cannot be undone.')}
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
