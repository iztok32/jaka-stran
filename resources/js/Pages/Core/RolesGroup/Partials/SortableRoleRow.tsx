import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableRow } from '@/Components/ui/table';
import { GripVertical } from 'lucide-react';

interface Props {
    id: number;
    children: React.ReactNode;
}

export default function SortableRoleRow({ id, children }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <TableRow ref={setNodeRef} style={style} {...attributes}>
            <td className="w-8 cursor-grab active:cursor-grabbing" {...listeners}>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </td>
            {children}
        </TableRow>
    );
}
