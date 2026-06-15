import { useCallback, useRef, useState } from 'react'
import {
    DndContext, DragEndEvent, MouseSensor, TouchSensor,
    closestCenter, useSensor, useSensors,
} from '@dnd-kit/core'
import {
    SortableContext, arrayMove, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GalleryPhoto, Tag } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { CheckSquare, GripVertical, ImagePlus, Loader2, Square, Star, Tag as TagIcon, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover'
import TagInput from '@/Components/TagInput'
import { Button } from '@/Components/ui/button'
import { Textarea } from '@/Components/ui/textarea'
import { apiFetch } from '@/lib/api'

interface PendingPhoto {
    id: string
    file: File
    previewUrl: string
    uploading: boolean
    error?: string
}

interface PortfolioService {
    title: string
    portfolioTag: string
}

interface PhotoUploaderProps {
    galleryId: number
    photos: GalleryPhoto[]
    coverId: number | null
    allTags?: Tag[]
    portfolioServices?: PortfolioService[]
    onPhotosChange: (photos: GalleryPhoto[]) => void
    onCoverChange: (mediaId: number | null) => void
    canEdit: boolean
}

function PhotoTagPopover({
    photo, galleryId, allTags, portfolioServices = [], canEdit, onTagsChange, onDescriptionChange,
}: {
    photo: GalleryPhoto
    galleryId: number
    allTags: Tag[]
    portfolioServices: PortfolioService[]
    canEdit: boolean
    onTagsChange: (mediaId: number, tags: Tag[]) => void
    onDescriptionChange: (mediaId: number, description: string | null) => void
}) {
    const { t } = useTranslation()
    const [open, setOpen]         = useState(false)
    const [tags, setTags]         = useState<string[]>(photo.tags?.map(t => t.name) ?? [])
    const [saving, setSaving]     = useState(false)
    const [description, setDescription]       = useState(photo.description ?? '')
    const [savingDescription, setSavingDescription] = useState(false)

    const save = async (newTags: string[]) => {
        setTags(newTags)
        setSaving(true)
        try {
            const res = await apiFetch(route('galleries.photos.tags', { gallery: galleryId, mediaId: photo.id }), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: newTags.join(',') }),
            })
            if (res.ok) {
                const data = await res.json() as { tags: Tag[] }
                onTagsChange(photo.id, data.tags)
            }
        } finally {
            setSaving(false)
        }
    }

    const saveDescription = async () => {
        setSavingDescription(true)
        try {
            const res = await apiFetch(route('galleries.photos.description', { gallery: galleryId, mediaId: photo.id }), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description }),
            })
            if (res.ok) {
                const data = await res.json() as { description: string | null }
                onDescriptionChange(photo.id, data.description)
            }
        } finally {
            setSavingDescription(false)
        }
    }

    const hasTags = (photo.tags?.length ?? 0) > 0

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    title={t('Tags')}
                    className={cn(
                        'absolute bottom-1 left-1 p-1 rounded transition-all',
                        hasTags
                            ? 'bg-blue-500/80 text-white opacity-100'
                            : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-500/80'
                    )}
                    onClick={e => e.stopPropagation()}
                >
                    <TagIcon className="size-3" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" side="top" align="start" onClick={e => e.stopPropagation()}>
                <p className="text-xs font-medium mb-2 text-muted-foreground">{t('Photo tags')}</p>
                <TagInput
                    value={tags}
                    onChange={save}
                    suggestions={allTags}
                    disabled={!canEdit || saving}
                    placeholder={t('Add tags...')}
                />
                {saving && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin" />{t('Saving...')}
                    </p>
                )}
                <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">{t('Description')}</p>
                    <Textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        onBlur={() => { if (description !== (photo.description ?? '')) saveDescription() }}
                        disabled={!canEdit || savingDescription}
                        rows={2}
                        className="resize-none text-sm"
                        placeholder={t('Add a description...')}
                    />
                    {savingDescription && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Loader2 className="size-3 animate-spin" />{t('Saving...')}
                        </p>
                    )}
                </div>
                {!canEdit && (
                    <p className="text-xs text-muted-foreground mt-1">{t('No edit permission')}</p>
                )}
                {portfolioServices.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Portfolio storitev</p>
                        <div className="flex flex-wrap gap-1">
                            {portfolioServices.map(s => {
                                const active = tags.includes(s.portfolioTag)
                                return (
                                    <button
                                        key={s.portfolioTag}
                                        type="button"
                                        disabled={!canEdit || saving}
                                        onClick={() => {
                                            if (active) {
                                                save(tags.filter(t => t !== s.portfolioTag))
                                            } else {
                                                save([...tags, s.portfolioTag])
                                            }
                                        }}
                                        title={s.title}
                                        className={cn(
                                            'text-xs px-2 py-0.5 rounded border transition-colors font-mono',
                                            active
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-foreground'
                                        )}
                                    >
                                        {s.portfolioTag}
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            Klikni oznako, da fotografijo dodaš v portfolio storitve.
                        </p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

function SortablePhoto({
    photo, isCover, allTags, portfolioServices = [], galleryId, onDelete, onSetCover, onTagsChange, onDescriptionChange, canEdit,
    selectMode, selected, onToggleSelect,
}: {
    photo: GalleryPhoto
    isCover: boolean
    allTags: Tag[]
    portfolioServices: PortfolioService[]
    galleryId: number
    onDelete: (id: number) => void
    onSetCover: (id: number) => void
    onTagsChange: (mediaId: number, tags: Tag[]) => void
    onDescriptionChange: (mediaId: number, description: string | null) => void
    canEdit: boolean
    selectMode: boolean
    selected: boolean
    onToggleSelect: (id: number) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: photo.id, disabled: selectMode })

    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors',
                selected ? 'border-primary' : isCover ? 'border-yellow-400 dark:border-yellow-500' : 'border-transparent',
                isDragging && 'opacity-50 z-10 shadow-lg',
                selectMode && 'cursor-pointer'
            )}
            onClick={() => { if (selectMode) onToggleSelect(photo.id) }}
        >
            <img src={photo.thumb} alt={photo.name} className={cn('w-full h-full object-cover', selectMode && selected && 'opacity-70')} draggable={false} />

            {/* Selection checkbox */}
            {selectMode && (
                <div className="absolute top-1 left-1 p-0.5 rounded bg-black/50 text-white">
                    {selected ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4" />}
                </div>
            )}

            {/* Cover badge */}
            {isCover && (
                <div className="absolute top-1 left-7 flex items-center gap-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-semibold rounded px-1 py-0.5 leading-none">
                    <Star className="size-2.5 fill-current" />Cover
                </div>
            )}

            {/* Tag count badge */}
            {(photo.tags?.length ?? 0) > 0 && (
                <div className="absolute top-1 right-7 flex items-center gap-0.5 bg-blue-500/80 text-white text-[10px] rounded px-1 py-0.5 leading-none">
                    <TagIcon className="size-2.5" />{photo.tags!.length}
                </div>
            )}

            {canEdit && !selectMode && (
                <>
                    {/* Drag handle */}
                    <button
                        className="absolute top-1 left-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="size-3" />
                    </button>

                    {/* Delete */}
                    <button
                        type="button"
                        className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
                        onClick={() => onDelete(photo.id)}
                    >
                        <Trash2 className="size-3" />
                    </button>

                    {/* Set cover */}
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
                </>
            )}

            {/* Tag popover — visible always (not just on hover) when tags exist */}
            {!selectMode && (
                <PhotoTagPopover
                    photo={photo}
                    galleryId={galleryId}
                    allTags={allTags}
                    portfolioServices={portfolioServices}
                    canEdit={canEdit}
                    onTagsChange={onTagsChange}
                    onDescriptionChange={onDescriptionChange}
                />
            )}
        </div>
    )
}

function PendingPhotoCard({ photo, onRemove }: { photo: PendingPhoto; onRemove: (id: string) => void }) {
    return (
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent">
            <img src={photo.previewUrl} alt={photo.file.name} className={cn('w-full h-full object-cover', photo.uploading && 'opacity-60')} />
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
                <button type="button" className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white hover:bg-red-600/80 transition-colors" onClick={() => onRemove(photo.id)}>
                    <X className="size-3" />
                </button>
            )}
        </div>
    )
}

export default function PhotoUploader({
    galleryId, photos, coverId, allTags = [], portfolioServices = [], onPhotosChange, onCoverChange, canEdit,
}: PhotoUploaderProps) {
    const { t } = useTranslation()
    const [pending, setPending]       = useState<PendingPhoto[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef                = useRef<HTMLInputElement>(null)
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [bulkTags, setBulkTags]           = useState<string[]>([])
    const [bulkSavingTags, setBulkSavingTags]         = useState(false)
    const [bulkDescription, setBulkDescription]       = useState('')
    const [bulkSavingDescription, setBulkSavingDescription] = useState(false)

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    )

    const uploadFiles = useCallback(async (files: File[]) => {
        if (!canEdit) return
        const newPending: PendingPhoto[] = files.map(file => ({
            id: Math.random().toString(36).slice(2), file,
            previewUrl: URL.createObjectURL(file), uploading: true,
        }))
        setPending(prev => [...prev, ...newPending])

        const results = await Promise.all(newPending.map(async (pendingItem) => {
            const formData = new FormData()
            formData.append('photos[]', pendingItem.file)
            try {
                const res = await apiFetch(route('galleries.photos.upload', galleryId), {
                    method: 'POST', body: formData,
                })
                if (!res.ok) throw new Error()
                const data = await res.json() as { photos: GalleryPhoto[] }
                const uploaded = data.photos[0] ?? null
                setPending(prev => prev.filter(p => p.id !== pendingItem.id))
                URL.revokeObjectURL(pendingItem.previewUrl)
                return uploaded
            } catch {
                setPending(prev => prev.map(p => p.id === pendingItem.id ? { ...p, uploading: false, error: t('Upload failed') } : p))
                return null
            }
        }))

        const uploaded = results.filter((p): p is GalleryPhoto => p !== null)
        if (uploaded.length > 0) onPhotosChange([...photos, ...uploaded])
    }, [canEdit, galleryId, photos, onPhotosChange, t])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
        if (files.length) uploadFiles(files)
    }

    const handleDeletePhoto = async (mediaId: number) => {
        try {
            await apiFetch(route('galleries.photos.delete', { gallery: galleryId, mediaId }), {
                method: 'DELETE',
            })
            onPhotosChange(photos.filter(p => p.id !== mediaId))
            if (coverId === mediaId) onCoverChange(null)
        } catch { /* ignore */ }
    }

    const handleSetCover = async (mediaId: number) => {
        if (!canEdit) return
        const newCoverId = coverId === mediaId ? null : mediaId
        try {
            await apiFetch(route('galleries.cover.set', galleryId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ media_id: newCoverId }),
            })
            onCoverChange(newCoverId)
        } catch { /* ignore */ }
    }

    const handleTagsChange = (mediaId: number, newTags: Tag[]) => {
        onPhotosChange(photos.map(p => p.id === mediaId ? { ...p, tags: newTags } : p))
    }

    const handleDescriptionChange = (mediaId: number, description: string | null) => {
        onPhotosChange(photos.map(p => p.id === mediaId ? { ...p, description } : p))
    }

    const toggleSelectMode = () => {
        setSelectMode(prev => !prev)
        setSelectedIds(new Set())
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }

    const selectAll = () => setSelectedIds(new Set(photos.map(p => p.id)))
    const clearSelection = () => setSelectedIds(new Set())

    const applyBulkTags = async () => {
        if (selectedIds.size === 0 || bulkTags.length === 0) return
        setBulkSavingTags(true)
        try {
            const res = await apiFetch(route('galleries.photos.bulk-tags', galleryId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ media_ids: Array.from(selectedIds), tags: bulkTags.join(',') }),
            })
            if (res.ok) {
                const data = await res.json() as { tags: Record<string, Tag[]> }
                onPhotosChange(photos.map(p => data.tags[p.id] ? { ...p, tags: data.tags[p.id] } : p))
                setBulkTags([])
            }
        } finally {
            setBulkSavingTags(false)
        }
    }

    const applyBulkDescription = async () => {
        if (selectedIds.size === 0) return
        setBulkSavingDescription(true)
        try {
            const res = await apiFetch(route('galleries.photos.bulk-description', galleryId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ media_ids: Array.from(selectedIds), description: bulkDescription }),
            })
            if (res.ok) {
                const data = await res.json() as { description: string | null }
                onPhotosChange(photos.map(p => selectedIds.has(p.id) ? { ...p, description: data.description } : p))
                setBulkDescription('')
            }
        } finally {
            setBulkSavingDescription(false)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex  = photos.findIndex(p => p.id === active.id)
        const newIndex  = photos.findIndex(p => p.id === over.id)
        const reordered = arrayMove(photos, oldIndex, newIndex)
        onPhotosChange(reordered)
        await apiFetch(route('galleries.photos.reorder', galleryId), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            {canEdit && (
                <div
                    className={cn(
                        'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                        isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                >
                    <ImagePlus className={cn('size-8 mx-auto mb-2', isDragOver ? 'text-primary' : 'text-muted-foreground/50')} />
                    <p className="text-sm text-muted-foreground">{t('Drag & drop photos here, or click to select')}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WEBP · max 100 MB / foto</p>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden"
                        onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) uploadFiles(f); e.target.value = '' }} />
                </div>
            )}

            {allCount > 0 && (
                <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs text-muted-foreground">
                            {allCount} {allCount === 1 ? t('photo') : t('photos')}
                            {canEdit && !selectMode && photos.length > 1 && <span className="ml-1 opacity-60">· {t('drag to reorder')}</span>}
                            {canEdit && !selectMode && <span className="ml-1 opacity-60">· <Star className="size-2.5 inline" /> {t('cover')} · <TagIcon className="size-2.5 inline" /> {t('tags')}</span>}
                        </p>
                        {canEdit && photos.length > 1 && (
                            <Button type="button" size="sm" variant={selectMode ? 'secondary' : 'outline'} onClick={toggleSelectMode}>
                                <CheckSquare className="size-3.5 mr-1.5" />
                                {selectMode ? t('Cancel') : t('Select')}
                            </Button>
                        )}
                    </div>

                    {selectMode && (
                        <div className="flex flex-wrap items-center gap-2 mb-2 rounded-lg border bg-muted/40 p-2">
                            <span className="text-xs font-medium px-1">
                                {selectedIds.size} {t('selected')}
                            </span>
                            <Button type="button" size="sm" variant="ghost" onClick={selectAll}>{t('Select all')}</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={clearSelection} disabled={selectedIds.size === 0}>{t('Clear')}</Button>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" size="sm" variant="outline" disabled={selectedIds.size === 0}>
                                        <TagIcon className="size-3.5 mr-1.5" />{t('Add tags to selected')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-3" side="top" align="start">
                                    <p className="text-xs font-medium mb-2 text-muted-foreground">{t('Add tags to selected')}</p>
                                    <TagInput
                                        value={bulkTags}
                                        onChange={setBulkTags}
                                        suggestions={allTags}
                                        disabled={bulkSavingTags}
                                        placeholder={t('Add tags...')}
                                    />
                                    <Button type="button" size="sm" className="mt-2 w-full" onClick={applyBulkTags} disabled={bulkSavingTags || bulkTags.length === 0}>
                                        {bulkSavingTags ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : null}
                                        {t('Apply')}
                                    </Button>
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" size="sm" variant="outline" disabled={selectedIds.size === 0}>
                                        {t('Set description for selected')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-3" side="top" align="start">
                                    <p className="text-xs font-medium mb-2 text-muted-foreground">{t('Set description for selected')}</p>
                                    <Textarea
                                        value={bulkDescription}
                                        onChange={e => setBulkDescription(e.target.value)}
                                        disabled={bulkSavingDescription}
                                        rows={2}
                                        className="resize-none text-sm"
                                        placeholder={t('Add a description...')}
                                    />
                                    <Button type="button" size="sm" className="mt-2 w-full" onClick={applyBulkDescription} disabled={bulkSavingDescription}>
                                        {bulkSavingDescription ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : null}
                                        {t('Apply')}
                                    </Button>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {photos.map(photo => (
                                    <SortablePhoto
                                        key={photo.id}
                                        photo={photo}
                                        isCover={photo.id === coverId}
                                        allTags={allTags}
                                        portfolioServices={portfolioServices}
                                        galleryId={galleryId}
                                        onDelete={handleDeletePhoto}
                                        onSetCover={handleSetCover}
                                        onTagsChange={handleTagsChange}
                                        onDescriptionChange={handleDescriptionChange}
                                        canEdit={canEdit}
                                        selectMode={selectMode}
                                        selected={selectedIds.has(photo.id)}
                                        onToggleSelect={toggleSelect}
                                    />
                                ))}
                                {pending.map(p => <PendingPhotoCard key={p.id} photo={p} onRemove={removePending} />)}
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
