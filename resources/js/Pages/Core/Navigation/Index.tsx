import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { NavigationItem } from '@/types';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Plus, Eye, Check, Edit2 } from 'lucide-react';
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
import NavigationForm from './Partials/NavigationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Switch } from '@/Components/ui/switch';
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
import { SortableRow } from './Partials/SortableRow';

interface NavigationConfig {
    id: number;
    type: string;
    label: string;
    group: string;
    sort_order: number;
    is_visible: boolean;
}

interface Props {
    items: NavigationItem[];
    groups: Record<string, NavigationConfig[]>;
    configs: NavigationConfig[];
}

export default function Index({ items, groups, configs }: Props) {
    const { t } = useTranslation();
    const [localItems, setLocalItems] = useState(items);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NavigationItem | undefined>(undefined);
    const [activeType, setActiveType] = useState<string | undefined>(undefined);
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isBlockDeleteDialogOpen, setIsBlockDeleteDialogOpen] = useState(false);
    const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
    const [showActiveByType, setShowActiveByType] = useState<Record<string, boolean>>({
        main: false,
        team: false,
        project: false,
    });

    useEffect(() => {
        setLocalItems(items);
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleCreate = (type: string) => {
        setEditingItem(undefined);
        setActiveType(type);
        setIsSheetOpen(true);
    };

    const handleEdit = (item: NavigationItem) => {
        setEditingItem(item);
        setActiveType(item.type);
        setIsSheetOpen(true);
    };

    const handleDelete = (id: number) => {
        setItemToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('navigation.destroy', itemToDelete), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setItemToDelete(null);
                },
            });
        }
    };

    const confirmBlockDelete = () => {
        if (blockToDelete) {
            router.delete(route('navigation.deleteBlock', blockToDelete), {
                onSuccess: () => {
                    setIsBlockDeleteDialogOpen(false);
                    setBlockToDelete(null);
                },
            });
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDragEnd = (event: DragEndEvent, type: string) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Rekurzivna funkcija za iskanje elementa v hierarhiji
            const findItem = (items: NavigationItem[], id: number): NavigationItem | undefined => {
                for (const item of items) {
                    if (item.id === id) return item;
                    if (item.children) {
                        const found = findItem(item.children, id);
                        if (found) return found;
                    }
                }
                return undefined;
            };

            // Rekurzivna funkcija za iskanje sorojencev
            const findSiblings = (items: NavigationItem[], targetParentId: number | null | undefined): NavigationItem[] => {
                // Če iščemo top-level elemente
                if (targetParentId === null || targetParentId === undefined) {
                    return items.filter(i => !i.parent_id && i.type === type);
                }

                // Iščemo starša v hierarhiji
                for (const item of items) {
                    if (item.id === targetParentId) {
                        return item.children || [];
                    }
                    if (item.children) {
                        const found = findSiblings(item.children, targetParentId);
                        if (found.length > 0) return found;
                    }
                }
                return [];
            };

            // Rekurzivna funkcija za posodobitev elementa v hierarhiji
            const updateItemInHierarchy = (items: NavigationItem[], updatedItems: NavigationItem[]): NavigationItem[] => {
                return items.map(item => {
                    const updated = updatedItems.find(ui => ui.id === item.id);
                    if (updated) {
                        return { ...item, sort_order: updated.sort_order };
                    }
                    if (item.children) {
                        return { ...item, children: updateItemInHierarchy(item.children, updatedItems) };
                    }
                    return item;
                });
            };

            const activeItem = findItem(localItems, active.id as number);
            if (!activeItem) return;

            const siblings = findSiblings(localItems, activeItem.parent_id)
                .sort((a, b) => a.sort_order - b.sort_order);

            const oldIndex = siblings.findIndex(i => i.id === active.id);
            const newIndex = siblings.findIndex(i => i.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrderedItems = arrayMove(siblings, oldIndex, newIndex);
                const itemsWithNewOrder = newOrderedItems.map((item, index) => ({
                    ...item,
                    sort_order: index
                }));

                const updatedAllItems = updateItemInHierarchy(localItems, itemsWithNewOrder);
                setLocalItems(updatedAllItems);

                router.post(route('navigation.reorder', {
                    items: itemsWithNewOrder.map((item, index) => ({
                        id: item.id,
                        sort_order: index,
                    })),
                }));
            }
        }
    };

    const renderRows = (items: NavigationItem[], onlyActive: boolean, level = 0, parentId: number | null = null) => {
        const filteredByStatus = onlyActive
            ? items.filter(i => i.is_active)
            : items;

        const sortedItems = filteredByStatus.sort((a, b) => a.sort_order - b.sort_order);
        const itemIds = sortedItems.map(item => item.id);

        return (
            <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
            >
                {sortedItems.flatMap((item) => {
                    const hasChildren = !!(item.children && item.children.length > 0);
                    const isExpanded = !!expandedItems[item.id];

                    const rows = [
                        <SortableRow
                            key={item.id}
                            item={item}
                            level={level}
                            hasChildren={hasChildren}
                            isExpanded={!!isExpanded}
                            onToggleExpand={toggleExpand}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ];

                    if (hasChildren && isExpanded) {
                        rows.push(
                            <React.Fragment key={`children-${item.id}`}>
                                {renderRows(item.children || [], onlyActive, level + 1, item.id)}
                            </React.Fragment>
                        );
                    }

                    return rows;
                })}
            </SortableContext>
        );
    };

    const NavigationCard = ({ config }: { config: any }) => {
        const type = config.type;
        const onlyActive = showActiveByType[type] || false;
        const currentTitle = config.label;
        const [isEditingTitle, setIsEditingTitle] = useState(false);
        const [titleValue, setTitleValue] = useState(currentTitle);
        
        useEffect(() => {
            setTitleValue(currentTitle);
        }, [currentTitle]);
        
        const topLevelItems = useMemo(() =>
            localItems.filter(item => item.type === type && !item.parent_id)
                .filter(item => !onlyActive || item.is_active)
                .sort((a, b) => a.sort_order - b.sort_order)
        , [localItems, type, onlyActive]);

        const saveTitle = () => {
            if (titleValue !== currentTitle) {
                router.post(route('navigation.updateConfig'), {
                    type,
                    label: titleValue
                }, {
                    onSuccess: () => setIsEditingTitle(false)
                });
            } else {
                setIsEditingTitle(false);
            }
        };

        const deleteBlock = () => {
            setBlockToDelete(type);
            setIsBlockDeleteDialogOpen(true);
        };

        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2 group cursor-pointer h-9">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    className="text-lg font-semibold bg-transparent border-b border-primary focus:outline-none"
                                    value={titleValue}
                                    onChange={(e) => setTitleValue(e.target.value)}
                                    onBlur={saveTitle}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveTitle();
                                        if (e.key === 'Escape') {
                                            setTitleValue(currentTitle);
                                            setIsEditingTitle(false);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <CardTitle 
                                className="flex items-center gap-2"
                                onClick={() => setIsEditingTitle(true)}
                            >
                                {t(currentTitle)}
                                <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                            </CardTitle>
                        )}
                        {!['main', 'header', 'settings', 'users'].includes(type) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteBlock();
                                }}
                            >
                                <Plus className="h-4 w-4 rotate-45" />
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative inline-flex items-center">
                            <Switch 
                                id={`show-active-${type}`} 
                                checked={onlyActive}
                                onCheckedChange={(val) => setShowActiveByType(prev => ({ ...prev, [type]: val }))}
                                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-200"
                            />
                            <Eye className={`pointer-events-none absolute left-1 h-3 w-3 text-slate-500 transition-opacity duration-200 ${onlyActive ? 'opacity-0' : 'opacity-100'}`} />
                            <Check className={`pointer-events-none absolute right-1 h-3 w-3 text-green-500 transition-opacity duration-200 ${onlyActive ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <Button onClick={() => handleCreate(type)} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('Add New Item')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(e, type)}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>{t('Title')}</TableHead>
                                    <TableHead className="w-[300px]">{t('URL')}</TableHead>
                                    <TableHead className="w-[150px]">{t('Status')}</TableHead>
                                    <TableHead className="w-[120px] text-right">{t('Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topLevelItems.length > 0 ? (
                                    renderRows(topLevelItems, onlyActive)
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            {t('No navigation items found.')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </CardContent>
            </Card>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Navigation Management')}
                </h2>
            }
        >
            <Head title={t('Navigation')} />

            <div className="space-y-8">
                <Tabs defaultValue="main" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="main">{t('Glavni meni')}</TabsTrigger>
                        <TabsTrigger value="settings">{t('Nastavitveni (settings)')}</TabsTrigger>
                        <TabsTrigger value="users">{t('Uporabnikov meni')}</TabsTrigger>
                        <TabsTrigger value="header">{t('Glava (header)')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="main" className="space-y-8">
                        <div className="flex justify-end">
                            <Button 
                                onClick={() => {
                                    const label = prompt(t('Enter block name'));
                                    if (label) {
                                        router.post(route('navigation.addBlock'), { label });
                                    }
                                }}
                                variant="outline"
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                {t('Add New Block')}
                            </Button>
                        </div>
                        {groups.main?.map(config => (
                            <NavigationCard key={config.type} config={config} />
                        ))}
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-8">
                        {groups.settings?.map(config => (
                            <NavigationCard key={config.type} config={config} />
                        ))}
                    </TabsContent>

                    <TabsContent value="users" className="space-y-8">
                        {groups.users?.map(config => (
                            <NavigationCard key={config.type} config={config} />
                        ))}
                    </TabsContent>

                    <TabsContent value="header" className="space-y-8">
                        {groups.header?.map(config => (
                            <NavigationCard key={config.type} config={config} />
                        ))}
                    </TabsContent>
                </Tabs>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-[500px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingItem ? t('Edit Item') : t('Add New Item')}</SheetTitle>
                        <SheetDescription>
                            {t('Configure your side menu item here. Click save when you\'re done.')}
                        </SheetDescription>
                    </SheetHeader>
                    <NavigationForm
                        item={editingItem}
                        items={localItems}
                        configs={configs}
                        fixedType={activeType}
                        onSuccess={() => setIsSheetOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Confirm Delete')}</DialogTitle>
                        <DialogDescription>
                            {t('Are you sure you want to delete this navigation item? This action cannot be undone.')}
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
            <Dialog open={isBlockDeleteDialogOpen} onOpenChange={setIsBlockDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Confirm Delete Block')}</DialogTitle>
                        <DialogDescription>
                            {t('Are you sure you want to delete this navigation block and all its items? This action cannot be undone.')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsBlockDeleteDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmBlockDelete}>
                            {t('Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
