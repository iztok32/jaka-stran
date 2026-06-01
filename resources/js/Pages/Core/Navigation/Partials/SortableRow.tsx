import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableRow, TableCell } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { Edit2, Trash2, GripVertical, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { NavigationItem } from '@/types';
import { useTranslation } from '@/lib/i18n';

const IconMapper = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return <HelpCircle className="h-4 w-4 text-muted-foreground/50" />;
    return <IconComponent className="h-4 w-4 text-muted-foreground" />;
};

interface Props {
    item: NavigationItem;
    level: number;
    hasChildren: boolean;
    isExpanded: boolean;
    onToggleExpand: (id: number) => void;
    onEdit: (item: NavigationItem) => void;
    onDelete: (id: number) => void;
}

export function SortableRow({
    item,
    level,
    hasChildren,
    isExpanded,
    onToggleExpand,
    onEdit,
    onDelete,
}: Props) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative' as const,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={level > 0 ? 'bg-muted/30' : ''}
        >
            <TableCell className="w-[50px]">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                    {hasChildren ? (
                        <button onClick={() => onToggleExpand(item.id)} className="p-1 hover:bg-muted rounded">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}
                    <div className="flex items-center mr-2">
                        {IconMapper(item.icon || undefined)}
                    </div>
                    <span className="font-medium">{t(item.title_key)}</span>
                    {item.children && item.children.length > 0 && (
                        <Badge variant="default" className="ml-2 px-1 text-[10px] h-4">
                            {item.children.length}
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell className="w-[300px]">
                <span className="truncate block max-w-[280px]" title={item.url || '-'}>
                    {item.url || '-'}
                </span>
            </TableCell>
            <TableCell className="w-[150px]">
                <Badge variant={item.is_active ? 'default' : 'secondary'}>
                    {item.is_active ? t('Active') : t('Inactive')}
                </Badge>
            </TableCell>
            <TableCell className="w-[120px] text-right">
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
