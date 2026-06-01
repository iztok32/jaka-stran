import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps, Article } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Badge } from '@/Components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/Components/ui/card'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/Components/ui/sheet'
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
    Globe, Lock, FileText, LayoutList, LayoutGrid, Filter, Eye,
} from 'lucide-react'
import ArticleForm from './Partials/ArticleForm'
import { cn } from '@/lib/utils'

interface Props extends PageProps {
    articles: Article[]
}

type ViewMode = 'table' | 'card'
type StatusFilter = 'all' | 'draft' | 'published' | 'archived'

function StatusBadge({ status }: { status: Article['status'] }) {
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

function ArticleActions({
    article, canEdit, canDelete, onEdit, onDelete, onPreview,
}: {
    article: Article
    canEdit: boolean
    canDelete: boolean
    onEdit: (a: Article) => void
    onDelete: (a: Article) => void
    onPreview: (a: Article) => void
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
                <DropdownMenuItem onClick={() => onPreview(article)}>
                    <Eye className="size-4 mr-2" />{t('Preview')}
                </DropdownMenuItem>
                {canEdit && <DropdownMenuSeparator />}
                {canEdit && (
                    <DropdownMenuItem onClick={() => onEdit(article)}>
                        <Pencil className="size-4 mr-2" />{t('Edit')}
                    </DropdownMenuItem>
                )}
                {canDelete && (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(article)}
                    >
                        <Trash2 className="size-4 mr-2" />{t('Delete')}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ArticlePreviewSheet({ article, onClose }: { article: Article | null; onClose: () => void }) {
    const { t } = useTranslation()

    const formatDate = (iso?: string | null) => {
        if (!iso) return null
        return new Date(iso).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const statusMap = {
        draft:     { label: t('Draft'),     className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        published: { label: t('Published'), className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        archived:  { label: t('Archived'),  className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    }

    return (
        <Sheet open={!!article} onOpenChange={open => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0">
                {article && (
                    <>
                        {/* Featured image */}
                        {article.featured_image ? (
                            <div className="w-full aspect-video bg-muted overflow-hidden">
                                <img
                                    src={article.featured_image}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-4" />
                        )}

                        <div className="px-6 py-6 space-y-4">
                            {/* Badges row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={cn('font-normal', statusMap[article.status].className)}>
                                    {statusMap[article.status].label}
                                </Badge>
                                {article.is_public
                                    ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><Globe className="size-3" />{t('Public')}</span>
                                    : <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400"><Lock className="size-3" />{t('Private')}</span>
                                }
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl font-bold leading-snug">{article.title}</h1>

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground border-b pb-4">
                                <span>{article.author.name}</span>
                                {(article.published_at || article.created_at) && (
                                    <>
                                        <span className="text-border">·</span>
                                        <span>{formatDate(article.published_at ?? article.created_at)}</span>
                                    </>
                                )}
                                {article.slug && (
                                    <>
                                        <span className="text-border">·</span>
                                        <span className="font-mono text-xs">{article.slug}</span>
                                    </>
                                )}
                            </div>

                            {/* Excerpt */}
                            {article.excerpt && (
                                <p className="text-base text-muted-foreground italic leading-relaxed border-l-4 border-border pl-4">
                                    {article.excerpt}
                                </p>
                            )}

                            {/* Content */}
                            {article.content ? (
                                <div
                                    className="article-content"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            ) : (
                                <p className="text-muted-foreground text-sm italic">{t('No content yet.')}</p>
                            )}

                            {/* Gallery */}
                            {article.gallery && article.gallery.length > 0 && (
                                <div className="pt-4 border-t space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">{t('Gallery')}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {article.gallery.map(img => (
                                            <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={img.thumb}
                                                    alt={img.name}
                                                    className="w-full aspect-video object-cover rounded-lg hover:opacity-90 transition-opacity"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default function ArticlesIndex({ articles }: Props) {
    const { t } = useTranslation()
    const { auth } = usePage<Props>().props
    const userPermissions = auth.user.permissions ?? []

    const canCreate = userPermissions.includes('articles.create')
    const canEdit   = userPermissions.includes('articles.edit')
    const canDelete = userPermissions.includes('articles.delete')

    const [search, setSearch]               = useState('')
    const [viewMode, setViewMode]           = useState<ViewMode>('table')
    const [statusFilter, setStatusFilter]   = useState<StatusFilter>('all')
    const [isSheetOpen, setIsSheetOpen]     = useState(false)
    const [editingArticle, setEditingArticle] = useState<Article | null>(null)
    const [deletingArticle, setDeletingArticle] = useState<Article | null>(null)
    const [previewingArticle, setPreviewingArticle] = useState<Article | null>(null)

    const filtered = articles.filter(a => {
        const matchesSearch =
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.author.name.toLowerCase().includes(search.toLowerCase()) ||
            a.slug.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const openCreate = () => { setEditingArticle(null); setIsSheetOpen(true) }
    const openEdit   = (a: Article) => { setEditingArticle(a); setIsSheetOpen(true) }

    const confirmDelete = () => {
        if (!deletingArticle) return
        router.delete(route('articles.destroy', deletingArticle.id), {
            onSuccess: () => setDeletingArticle(null),
        })
    }

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const isEmpty = filtered.length === 0
    const hasActiveFilter = search || statusFilter !== 'all'

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl leading-tight">{t('Articles')}</h2>}>
            <Head title={t('Articles')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        {/* Header */}
                        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                            <CardTitle className="text-lg">{t('Articles management')}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t('Search articles...')}
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
                                        {t('Add Article')}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className={viewMode === 'table' ? 'p-0' : 'pt-0'}>
                            {/* ── TABLE VIEW ── */}
                            {viewMode === 'table' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"></TableHead>
                                            <TableHead>{t('Title')}</TableHead>
                                            <TableHead>{t('Status')}</TableHead>
                                            <TableHead>{t('Access')}</TableHead>
                                            <TableHead>{t('Author')}</TableHead>
                                            <TableHead>{t('Published')}</TableHead>
                                            <TableHead>{t('Created')}</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isEmpty ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                                    <FileText className="size-8 mx-auto mb-2 opacity-30" />
                                                    {hasActiveFilter ? t('No articles match your search.') : t('No articles yet.')}
                                                </TableCell>
                                            </TableRow>
                                        ) : filtered.map(article => (
                                            <TableRow key={article.id} className={cn(article.deleted_at && 'opacity-50')}>
                                                <TableCell className="pr-0">
                                                    {article.featured_image_thumb ? (
                                                        <img src={article.featured_image_thumb} alt="" className="size-10 rounded object-cover" />
                                                    ) : (
                                                        <div className="size-10 rounded bg-muted flex items-center justify-center">
                                                            <FileText className="size-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{article.title}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{article.slug}</div>
                                                </TableCell>
                                                <TableCell><StatusBadge status={article.status} /></TableCell>
                                                <TableCell><AccessBadge isPublic={article.is_public} /></TableCell>
                                                <TableCell className="text-sm">{article.author.name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(article.published_at)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(article.created_at)}</TableCell>
                                                <TableCell>
                                                    <ArticleActions
                                                        article={article}
                                                        canEdit={canEdit}
                                                        canDelete={canDelete}
                                                        onEdit={openEdit}
                                                        onDelete={setDeletingArticle}
                                                        onPreview={setPreviewingArticle}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {/* ── CARD VIEW ── */}
                            {viewMode === 'card' && (
                                isEmpty ? (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <FileText className="size-10 mx-auto mb-3 opacity-30" />
                                        <p>{hasActiveFilter ? t('No articles match your search.') : t('No articles yet.')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                                        {filtered.map(article => (
                                            <div
                                                key={article.id}
                                                className={cn(
                                                    'group flex flex-col rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md',
                                                    article.deleted_at && 'opacity-50'
                                                )}
                                            >
                                                {/* Image */}
                                                <div className="relative aspect-video bg-muted overflow-hidden">
                                                    {article.featured_image_thumb ? (
                                                        <img
                                                            src={article.featured_image_thumb}
                                                            alt={article.title}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <FileText className="size-10 text-muted-foreground/40" />
                                                        </div>
                                                    )}
                                                    {/* Status badge overlay */}
                                                    <div className="absolute top-2 left-2">
                                                        <StatusBadge status={article.status} />
                                                    </div>
                                                    {/* Actions overlay */}
                                                    <div className="absolute top-1.5 right-1.5">
                                                        <ArticleActions
                                                            article={article}
                                                            canEdit={canEdit}
                                                            canDelete={canDelete}
                                                            onEdit={openEdit}
                                                            onDelete={setDeletingArticle}
                                                            onPreview={setPreviewingArticle}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="flex flex-col flex-1 p-3 gap-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
                                                            {article.title}
                                                        </h3>
                                                        <AccessBadge isPublic={article.is_public} />
                                                    </div>

                                                    {article.excerpt && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {article.excerpt}
                                                        </p>
                                                    )}

                                                    {/* Footer */}
                                                    <div className="mt-auto pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>{article.author.name}</span>
                                                        <span>{formatDate(article.published_at ?? article.created_at)}</span>
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
                            {editingArticle ? t('Edit Article') : t('Add Article')}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                        <ArticleForm
                            article={editingArticle}
                            onSuccess={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Article preview */}
            <ArticlePreviewSheet
                article={previewingArticle}
                onClose={() => setPreviewingArticle(null)}
            />

            {/* Delete confirmation */}
            <AlertDialog open={!!deletingArticle} onOpenChange={open => !open && setDeletingArticle(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Delete Article')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('Are you sure you want to delete')} <strong>{deletingArticle?.title}</strong>?
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
