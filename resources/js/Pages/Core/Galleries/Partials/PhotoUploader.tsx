import { useCallback, useRef, useState } from 'react'
import {
    DndContext,
    DragEndEvent,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GalleryPhoto } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { GripVertical, ImagePlus, Loader2, Star, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingPhoto {
    id: string
    file: File
    previewUrl: string
    uploading: boolean
    error?: string
}

interface PhotoUploaderProps {
    galleryId: number
    photos: GalleryPhoto[]
    coverId: number | null
    onPhotosChange: (photos: GalleryPhoto[]) => void
    onCoverChange: (mediaId: number | null) => void
    canEdit: boolean
}

function SortablePhoto({
    photo,
    isCover,
    onDelete,
    onSetCover,
    canEdit,
}: {
    photo: GalleryPhoto
    isCover: boolean
    onDelete: (id: number) => void
    onSetCover: (id: number) => void
    canEdit: boolean
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: photo.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors',
                isCover ? 'border-yellow-400 dark:border-yellow-500' : 'border-transparent',
                isDragging && 'opacity-50 z-10 shadow-lg'
            )}
        >
            <img
                src={photo.thumb}
                alt={photo.name}
                className="w-full h-full object-cover"
                draggable={false}
            />

            {/* Cover badge */}
            {isCover && (
                <div className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-semibold rounded px-1 py-0.5 leading-none">
                    <Star className="size-2.5 fill-current" />
                    Cover
                </div>
            )}

            {canEdit && (
                <>
                    {/* Drag handle */}
                    <button
                        className="absolute top-1 left-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="size-3" />
                    </button>

                    {/* Set cover button */}
                    <button
                        type="button"
                        title="Set as cover"
                        className={cn(
                            'absolute bottom-1 right-1 p-1 rounded transition-all',
                            isCover
                                ? 'bg-yellow-400 text-yellow-900 opacity-100'
                                : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-yellow-400 hover:text-yellow-900'
                        )}
                        onClick={() => onSetCover(photo.id)}
                    >
                        <Star className={cn('size-3', isCover && 'fill-current')} />
                    </button>

                    {/* Delete button */}
                    <button
                        type="button"
                        className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
                        onClick={() => onDelete(photo.id)}
                    >
                        <Trash2 className="size-3" />
                    </button>
                </>
            )}
        </div>
    )
}

function PendingPhotoCard({ photo, onRemove }: { photo: PendingPhoto; onRemove: (id: string) => void }) {
    return (
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent">
            <img
                src={photo.previewUrl}
                alt={photo.file.name}
                className={cn('w-full h-full object-cover', photo.uploading && 'opacity-60')}
            />
            {photo.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="size-6 text-white animate-spin" />
                </div>
            )}
            {photo.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                    <span className="text-xs text-destructive font-medium px-1 text-center">{photo.error}</span>
                </div>
            )}
            {!photo.uploading && (
                <button
                    type="button"
                    className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white hover:bg-red-600/80 transition-colors"
                    onClick={() => onRemove(photo.id)}
                >
                    <X className="size-3" />
                </button>
            )}
        </div>
    )
}

export default function PhotoUploader({
    galleryId, photos, coverId, onPhotosChange, onCoverChange, canEdit,
}: PhotoUploaderProps) {
    const { t } = useTranslation()
    const [pending, setPending]       = useState<PendingPhoto[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef                = useRef<HTMLInputElement>(null)

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    )

    const getCsrf = () =>
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''

    const uploadFiles = useCallback(async (files: File[]) => {
        if (!canEdit) return

        const csrfToken = getCsrf()
        const newPending: PendingPhoto[] = files.map(file => ({
            id:         Math.random().toString(36).slice(2),
            file,
            previewUrl: URL.createObjectURL(file),
            uploading:  true,
        }))

        setPending(prev => [...prev, ...newPending])

        const results = await Promise.all(newPending.map(async (pendingItem) => {
            const formData = new FormData()
            formData.append('photos[]', pendingItem.file)

            try {
                const res = await fetch(route('galleries.photos.upload', galleryId), {
                    method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken },
                    credentials: 'same-origin', body: formData,
                })
                if (!res.ok) throw new Error()
                const data = await res.json() as { photos: GalleryPhoto[] }
                const uploaded = data.photos[0] ?? null
                setPending(prev => prev.filter(p => p.id !== pendingItem.id))
                URL.revokeObjectURL(pendingItem.previewUrl)
                return uploaded
            } catch {
                setPending(prev =>
                    prev.map(p => p.id === pendingItem.id
                        ? { ...p, uploading: false, error: t('Upload failed') } : p)
                )
                return null
            }
        }))

        const uploaded = results.filter((p): p is GalleryPhoto => p !== null)
        if (uploaded.length > 0) {
            onPhotosChange([...photos, ...uploaded])
        }
    }, [canEdit, galleryId, photos, onPhotosChange, t])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (files.length) uploadFiles(files)
        e.target.value = ''
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
        if (files.length) uploadFiles(files)
    }

    const handleDeletePhoto = async (mediaId: number) => {
        const csrfToken = getCsrf()
        try {
            await fetch(route('galleries.photos.delete', { gallery: galleryId, mediaId }), {
                method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrfToken },
                credentials: 'same-origin',
            })
            onPhotosChange(photos.filter(p => p.id !== mediaId))
            if (coverId === mediaId) onCoverChange(null)
        } catch { /* silently ignore */ }
    }

    const handleSetCover = async (mediaId: number) => {
        if (!canEdit) return
        const newCoverId = coverId === mediaId ? null : mediaId
        const csrfToken = getCsrf()
        try {
            await fetch(route('galleries.cover.set', galleryId), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ media_id: newCoverId }),
            })
            onCoverChange(newCoverId)
        } catch { /* silently ignore */ }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex  = photos.findIndex(p => p.id === active.id)
        const newIndex  = photos.findIndex(p => p.id === over.id)
        const reordered = arrayMove(photos, oldIndex, newIndex)
        onPhotosChange(reordered)

        const csrfToken = getCsrf()
        await fetch(route('galleries.photos.reorder', galleryId), {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ order: reordered.map(p => p.id) }),
        })
    }

    const removePending = (id: string) => {
        setPending(prev => {
            const item = prev.find(p => p.id === id)
            if (item) URL.revokeObjectURL(item.previewUrl)
            return prev.filter(p => p.id !== id)
        })
    }

    const allCount = photos.length + pending.length

    return (
        <div className="space-y-3">
            {/* Drop zone */}
            {canEdit && (
                <div
                    className={cn(
                        'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                >
                    <ImagePlus className={cn('size-8 mx-auto mb-2', isDragOver ? 'text-primary' : 'text-muted-foreground/50')} />
                    <p className="text-sm text-muted-foreground">
                        {t('Drag & drop photos here, or click to select')}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WEBP · max 100 MB / foto</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        className="hidden"
                        onChange={handleFileInput}
                    />
                </div>
            )}

            {/* Photo grid */}
            {allCount > 0 && (
                <div>
                    <p className="text-xs text-muted-foreground mb-2">
                        {allCount} {allCount === 1 ? t('photo') : t('photos')}
                        {canEdit && photos.length > 1 && (
                            <span className="ml-1 opacity-60">· {t('drag to reorder')}</span>
                        )}
                        {canEdit && photos.length > 0 && (
                            <span className="ml-1 opacity-60">· {t('click')} <Star className="size-2.5 inline" /> {t('to set cover')}</span>
                        )}
                    </p>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {photos.map(photo => (
                                    <SortablePhoto
                                        key={photo.id}
                                        photo={photo}
                                        isCover={photo.id === coverId}
                                        onDelete={handleDeletePhoto}
                                        onSetCover={handleSetCover}
                                        canEdit={canEdit}
                                    />
                                ))}
                                {pending.map(p => (
                                    <PendingPhotoCard key={p.id} photo={p} onRemove={removePending} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {!canEdit && photos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('No photos yet.')}</p>
            )}
        </div>
    )
}
