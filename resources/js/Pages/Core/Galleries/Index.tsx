import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps, Gallery, Tag } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Badge } from '@/Components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/Components/ui/sheet'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/table'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/Components/ui/dropdown-menu'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select'
import {
    Plus, Search, Pencil, Trash2, MoreHorizontal,
    Globe, Lock, Images, LayoutList, LayoutGrid, Filter, Eye,
} from 'lucide-react'
import GalleryForm from './Partials/GalleryForm'
import { cn } from '@/lib/utils'

interface PortfolioService {
    title: string
    portfolioTag: string
}

interface Props extends PageProps {
    galleries: Gallery[]
    allTags: Tag[]
    portfolioServices: PortfolioService[]
}

type ViewMode = 'table' | 'card'
type StatusFilter = 'all' | 'draft' | 'published' | 'archived'

function StatusBadge({ status }: { status: Gallery['status'] }) {
    const { t } = useTranslation()
    const map = {
        draft:     { label: t('Draft'),     className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        published: { label: t('Published'), className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        archived:  { label: t('Archived'),  className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    }
    const { label, className } = map[status]
    return <Badge className={cn('font-normal', className)}>{label}</Badge>
}

function AccessBadge({ isPublic }: { isPublic: boolean }) {
    const { t } = useTranslation()
    return isPublic
        ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><Globe className="size-3" />{t('Public')}</span>
        : <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400"><Lock className="size-3" />{t('Private')}</span>
}

function GalleryActions({
    gallery, canEdit, canDelete, onEdit, onDelete, onPreview,
}: {
    gallery: Gallery
    canEdit: boolean
    canDelete: boolean
    onEdit: (g: Gallery) => void
    onDelete: (g: Gallery) => void
    onPreview: (g: Gallery) => void
}) {
    const { t } = useTranslation()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPreview(gallery)}>
                    <Eye className="size-4 mr-2" />{t('Preview')}
                </DropdownMenuItem>
                {canEdit && <DropdownMenuSeparator />}
                {canEdit && (
                    <DropdownMenuItem onClick={() => onEdit(gallery)}>
                        <Pencil className="size-4 mr-2" />{t('Edit')}
                    </DropdownMenuItem>
                )}
                {canDelete && (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(gallery)}
                    >
                        <Trash2 className="size-4 mr-2" />{t('Delete')}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function GalleryPreviewSheet({ gallery, onClose }: { gallery: Gallery | null; onClose: () => void }) {
    const { t } = useTranslation()

    const statusMap = {
        draft:     { label: t('Draft'),     className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        published: { label: t('Published'), className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        archived:  { label: t('Archived'),  className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    }

    return (
        <Sheet open={!!gallery} onOpenChange={open => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0">
                {gallery && (
                    <>
                        {/* Cover */}
                        {gallery.cover ? (
                            <div className="w-full aspect-video bg-muted overflow-hidden">
                                <img src={gallery.cover} alt={gallery.title} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-4" />
                        )}

                        <div className="px-6 py-6 space-y-5">
                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={cn('font-normal', statusMap[gallery.status].className)}>
                                    {statusMap[gallery.status].label}
                                </Badge>
                                {gallery.is_public
                                    ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><Globe className="size-3" />{t('Public')}</span>
                                    : <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400"><Lock className="size-3" />{t('Private')}</span>
                                }
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Images className="size-3" />{gallery.photos_count} {t('photos')}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl font-bold leading-snug">{gallery.title}</h1>

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground border-b pb-4">
                                <span>{gallery.author.name}</span>
                                <span className="text-border">·</span>
                                <span>{formatDate(gallery.gallery_date ?? gallery.created_at)}</span>
                                {gallery.slug && (
                                    <>
                                        <span className="text-border">·</span>
                                        <span className="font-mono text-xs">{gallery.slug}</span>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            {gallery.description && (
                                <p className="text-base text-muted-foreground leading-relaxed">{gallery.description}</p>
                            )}

                            {/* Photo grid */}
                            {gallery.photos.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">{t('Photos')}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {gallery.photos.map(photo => (
                                            <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="block">
                                                <img
                                                    src={photo.thumb}
                                                    alt={photo.name}
                                                    className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {gallery.photos.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Images className="size-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">{t('No photos yet.')}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default function GalleriesIndex({ galleries, allTags, portfolioServices }: Props) {
    const { t } = useTranslation()
    const { auth } = usePage<Props>().props
    const userPermissions = auth.user.permissions ?? []

    const canCreate = userPermissions.includes('galleries.create')
    const canEdit   = userPermissions.includes('galleries.edit')
    const canDelete = userPermissions.includes('galleries.delete')

    const [search, setSearch]                     = useState('')
    const [viewMode, setViewMode]                 = useState<ViewMode>('card')
    const [statusFilter, setStatusFilter]         = useState<StatusFilter>('all')
    const [isSheetOpen, setIsSheetOpen]           = useState(false)
    const [editingGallery, setEditingGallery]     = useState<Gallery | null>(null)
    const [deletingGallery, setDeletingGallery]   = useState<Gallery | null>(null)
    const [previewingGallery, setPreviewingGallery] = useState<Gallery | null>(null)

    const filtered = galleries.filter(g => {
        const matchesSearch =
            g.title.toLowerCase().includes(search.toLowerCase()) ||
            g.author.name.toLowerCase().includes(search.toLowerCase()) ||
            g.slug.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || g.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const openCreate = () => { setEditingGallery(null); setIsSheetOpen(true) }
    const openEdit   = (g: Gallery) => { setEditingGallery(g); setIsSheetOpen(true) }

    const confirmDelete = () => {
        if (!deletingGallery) return
        router.delete(route('galleries.destroy', deletingGallery.id), {
            onSuccess: () => setDeletingGallery(null),
        })
    }

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const isEmpty           = filtered.length === 0
    const hasActiveFilter   = search || statusFilter !== 'all'

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl leading-tight">{t('Galleries')}</h2>}>
            <Head title={t('Galleries')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        {/* Header */}
                        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                            <CardTitle className="text-lg">{t('Gallery management')}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t('Search galleries...')}
                                        className="pl-8 w-44"
                                    />
                                </div>

                                {/* Status filter */}
                                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
                                    <SelectTrigger className="w-36 gap-1.5">
                                        <Filter className="size-3.5 text-muted-foreground shrink-0" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All statuses')}</SelectItem>
                                        <SelectItem value="draft">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-yellow-400 inline-block" />
                                                {t('Draft')}
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="published">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-green-500 inline-block" />
                                                {t('Published')}
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-gray-400 inline-block" />
                                                {t('Archived')}
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* View toggle */}
                                <div className="flex items-center border rounded-md overflow-hidden">
                                    <Button
                                        variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="size-9 rounded-none border-0"
                                        onClick={() => setViewMode('table')}
                                        title={t('Table view')}
                                    >
                                        <LayoutList className="size-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="size-9 rounded-none border-0"
                                        onClick={() => setViewMode('card')}
                                        title={t('Card view')}
                                    >
                                        <LayoutGrid className="size-4" />
                                    </Button>
                                </div>

                                {/* Add button */}
                                {canCreate && (
                                    <Button onClick={openCreate} size="sm">
                                        <Plus className="size-4 mr-1" />
                                        {t('Add Gallery')}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className={viewMode === 'table' ? 'p-0' : 'pt-0'}>
                            {/* TABLE VIEW */}
                            {viewMode === 'table' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"></TableHead>
                                            <TableHead>{t('Title')}</TableHead>
                                            <TableHead>{t('Photos')}</TableHead>
                                            <TableHead>{t('Status')}</TableHead>
                                            <TableHead>{t('Access')}</TableHead>
                                            <TableHead>{t('Author')}</TableHead>
                                            <TableHead>{t('Date')}</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isEmpty ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                                    <Images className="size-8 mx-auto mb-2 opacity-30" />
                                                    {hasActiveFilter ? t('No galleries match your search.') : t('No galleries yet.')}
                                                </TableCell>
                                            </TableRow>
                                        ) : filtered.map(gallery => (
                                            <TableRow key={gallery.id} className={cn(gallery.deleted_at && 'opacity-50')}>
                                                <TableCell className="pr-0">
                                                    {gallery.cover_thumb ? (
                                                        <img src={gallery.cover_thumb} alt="" className="size-10 rounded object-cover" />
                                                    ) : (
                                                        <div className="size-10 rounded bg-muted flex items-center justify-center">
                                                            <Images className="size-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{gallery.title}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{gallery.slug}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Images className="size-3.5" />
                                                        {gallery.photos_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell><StatusBadge status={gallery.status} /></TableCell>
                                                <TableCell><AccessBadge isPublic={gallery.is_public} /></TableCell>
                                                <TableCell className="text-sm">{gallery.author.name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(gallery.gallery_date ?? gallery.created_at)}</TableCell>
                                                <TableCell>
                                                    <GalleryActions
                                                        gallery={gallery}
                                                        canEdit={canEdit}
                                                        canDelete={canDelete}
                                                        onEdit={openEdit}
                                                        onDelete={setDeletingGallery}
                                                        onPreview={setPreviewingGallery}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {/* CARD VIEW */}
                            {viewMode === 'card' && (
                                isEmpty ? (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <Images className="size-10 mx-auto mb-3 opacity-30" />
                                        <p>{hasActiveFilter ? t('No galleries match your search.') : t('No galleries yet.')}</p>
                                        {!hasActiveFilter && canCreate && (
                                            <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                                                <Plus className="size-4 mr-1" />{t('Create first gallery')}
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                                        {filtered.map(gallery => (
                                            <div
                                                key={gallery.id}
                                                className={cn(
                                                    'group flex flex-col rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md',
                                                    gallery.deleted_at && 'opacity-50'
                                                )}
                                            >
                                                {/* Cover / photo strip */}
                                                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                                                    {gallery.cover_thumb ? (
                                                        <img
                                                            src={gallery.cover_thumb}
                                                            alt={gallery.title}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        />
                                                    ) : gallery.photos.length > 0 ? (
                                                        <div className="w-full h-full grid grid-cols-2 gap-0.5">
                                                            {gallery.photos.slice(0, 4).map((p, i) => (
                                                                <img
                                                                    key={p.id}
                                                                    src={p.thumb}
                                                                    alt=""
                                                                    className={cn(
                                                                        'w-full h-full object-cover',
                                                                        gallery.photos.length === 1 && 'col-span-2 row-span-2',
                                                                        gallery.photos.length === 3 && i === 0 && 'row-span-2'
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <Images className="size-12 text-muted-foreground/30" />
                                                        </div>
                                                    )}

                                                    {/* Overlays */}
                                                    <div className="absolute top-2 left-2">
                                                        <StatusBadge status={gallery.status} />
                                                    </div>
                                                    <div className="absolute top-1.5 right-1.5">
                                                        <GalleryActions
                                                            gallery={gallery}
                                                            canEdit={canEdit}
                                                            canDelete={canDelete}
                                                            onEdit={openEdit}
                                                            onDelete={setDeletingGallery}
                                                            onPreview={setPreviewingGallery}
                                                        />
                                                    </div>

                                                    {/* Photo count badge */}
                                                    {gallery.photos_count > 0 && (
                                                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs rounded-full px-2 py-0.5">
                                                            <Images className="size-3" />
                                                            {gallery.photos_count}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Body */}
                                                <div className="flex flex-col flex-1 p-3 gap-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
                                                            {gallery.title}
                                                        </h3>
                                                        <AccessBadge isPublic={gallery.is_public} />
                                                    </div>

                                                    {gallery.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {gallery.description}
                                                        </p>
                                                    )}

                                                    {gallery.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {gallery.tags.map(tag => (
                                                                <span key={tag.name} className="inline-block bg-secondary text-secondary-foreground text-[10px] rounded px-1.5 py-0.5">
                                                                    {tag.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="mt-auto pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>{gallery.author.name}</span>
                                                        <span>{formatDate(gallery.gallery_date ?? gallery.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create / Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingGallery ? t('Edit Gallery') : t('Add Gallery')}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                        <GalleryForm
                            gallery={editingGallery}
                            allTags={allTags}
                            portfolioServices={portfolioServices}
                            canEdit={canEdit || canCreate}
                            onSuccess={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Preview Sheet */}
            <GalleryPreviewSheet
                gallery={previewingGallery}
                onClose={() => setPreviewingGallery(null)}
            />

            {/* Delete confirmation */}
            <AlertDialog open={!!deletingGallery} onOpenChange={open => !open && setDeletingGallery(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Delete Gallery')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('Are you sure you want to delete')} <strong>{deletingGallery?.title}</strong>?
                            {' '}{t('This action cannot be undone.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            {t('Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    )
}
