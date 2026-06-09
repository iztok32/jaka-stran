import { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
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
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog'
import { Eye, MoreHorizontal, Search, Trash2, Filter, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Inquiry {
    id: number
    name: string
    email: string
    project_type?: string | null
    message: string
    status: 'new' | 'read' | 'replied' | 'archived'
    reply?: string | null
    replied_at?: string | null
    created_at: string
}

interface Props extends PageProps {
    inquiries: Inquiry[]
}

type StatusFilter = 'all' | 'new' | 'read' | 'replied' | 'archived'

function StatusBadge({ status }: { status: Inquiry['status'] }) {
    const map = {
        new:      { label: 'Novo',       className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        read:     { label: 'Prebrano',   className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        replied:  { label: 'Odgovorjeno', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        archived: { label: 'Arhivirano', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    }
    const { label, className } = map[status]
    return <Badge className={cn('font-normal', className)}>{label}</Badge>
}

export default function ContactInquiriesIndex({ inquiries }: Props) {
    const { t } = useTranslation()
    const { auth } = usePage<Props>().props
    const perms = auth.user.permissions ?? []
    const canEdit   = perms.includes('contact-inquiries.edit')
    const canDelete = perms.includes('contact-inquiries.delete')

    const [search, setSearch]               = useState('')
    const [statusFilter, setStatusFilter]   = useState<StatusFilter>('all')
    const [deletingId, setDeletingId]       = useState<number | null>(null)

    const filtered = inquiries.filter(i => {
        const matchSearch = [i.name, i.email, i.project_type ?? '', i.message]
            .join(' ').toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || i.status === statusFilter
        return matchSearch && matchStatus
    })

    const newCount = inquiries.filter(i => i.status === 'new').length

    const confirmDelete = () => {
        if (!deletingId) return
        router.delete(route('contact-inquiries.destroy', deletingId), {
            onSuccess: () => setDeletingId(null),
        })
    }

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    const isEmpty = filtered.length === 0

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-3">
                <h2 className="font-semibold text-xl leading-tight">{t('Contact Inquiries')}</h2>
                {newCount > 0 && (
                    <Badge className="bg-blue-500 text-white">{newCount} {t('new')}</Badge>
                )}
            </div>
        }>
            <Head title={t('Contact Inquiries')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                            <CardTitle className="text-lg">{t('Inquiries')}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('Search...')} className="pl-8 w-44" />
                                </div>
                                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
                                    <SelectTrigger className="w-40 gap-1.5">
                                        <Filter className="size-3.5 text-muted-foreground shrink-0" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All statuses')}</SelectItem>
                                        <SelectItem value="new">Novo</SelectItem>
                                        <SelectItem value="read">Prebrano</SelectItem>
                                        <SelectItem value="replied">Odgovorjeno</SelectItem>
                                        <SelectItem value="archived">Arhivirano</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('Name')}</TableHead>
                                        <TableHead>{t('Email')}</TableHead>
                                        <TableHead>Vrsta projekta</TableHead>
                                        <TableHead>Sporočilo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Datum</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isEmpty ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                                <MessageSquare className="size-8 mx-auto mb-2 opacity-30" />
                                                {search || statusFilter !== 'all' ? t('No results match your search.') : 'Ni še povpraševanj.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map(inquiry => (
                                        <TableRow key={inquiry.id} className={inquiry.status === 'new' ? 'font-medium' : ''}>
                                            <TableCell>{inquiry.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{inquiry.email}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{inquiry.project_type ?? '—'}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <p className="text-sm text-muted-foreground line-clamp-1">{inquiry.message}</p>
                                            </TableCell>
                                            <TableCell><StatusBadge status={inquiry.status} /></TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(inquiry.created_at)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8">
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('contact-inquiries.show', inquiry.id)}>
                                                                <Eye className="size-4 mr-2" />Odpri
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {canDelete && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingId(inquiry.id)}>
                                                                    <Trash2 className="size-4 mr-2" />{t('Delete')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Izbriši povpraševanje</AlertDialogTitle>
                        <AlertDialogDescription>Povpraševanje bo trajno izbrisano.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    )
}
