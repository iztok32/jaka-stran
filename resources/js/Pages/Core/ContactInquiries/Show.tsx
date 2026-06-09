import { useState } from 'react'
import { Head, Link, router, useForm, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Textarea } from '@/Components/ui/textarea'
import { Label } from '@/Components/ui/label'
import { Separator } from '@/Components/ui/separator'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select'
import { ArrowLeft, Mail, Send, User, Calendar, Tag } from 'lucide-react'
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
    inquiry: Inquiry
}

function StatusBadge({ status }: { status: Inquiry['status'] }) {
    const map = {
        new:      { label: 'Novo',        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        read:     { label: 'Prebrano',    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        replied:  { label: 'Odgovorjeno', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        archived: { label: 'Arhivirano',  className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    }
    const { label, className } = map[status]
    return <Badge className={cn('font-normal', className)}>{label}</Badge>
}

export default function ContactInquiryShow({ inquiry }: Props) {
    const { t } = useTranslation()
    const { auth } = usePage<Props>().props
    const perms   = auth.user.permissions ?? []
    const canEdit = perms.includes('contact-inquiries.edit')

    const { data, setData, post, processing, errors, reset } = useForm({ reply: inquiry.reply ?? '' })

    const sendReply = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('contact-inquiries.reply', inquiry.id), {
            onSuccess: () => {},
        })
    }

    const updateStatus = (status: string) => {
        router.patch(route('contact-inquiries.status', inquiry.id), { status }, { preserveScroll: true })
    }

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-3">
                <Link href={route('contact-inquiries.index')} className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="size-4" />
                </Link>
                <h2 className="font-semibold text-xl leading-tight">Povpraševanje</h2>
                <StatusBadge status={inquiry.status} />
            </div>
        }>
            <Head title={`Povpraševanje — ${inquiry.name}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Inquiry details */}
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{formatDate(inquiry.created_at)}</p>
                            </div>
                            {canEdit && (
                                <Select value={inquiry.status} onValueChange={updateStatus}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">Novo</SelectItem>
                                        <SelectItem value="read">Prebrano</SelectItem>
                                        <SelectItem value="replied">Odgovorjeno</SelectItem>
                                        <SelectItem value="archived">Arhivirano</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Meta */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="size-4 text-muted-foreground shrink-0" />
                                    <a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>
                                </div>
                                {inquiry.project_type && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Tag className="size-4 shrink-0" />
                                        {inquiry.project_type}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="size-4 shrink-0" />
                                    {formatDate(inquiry.created_at)}
                                </div>
                            </div>

                            <Separator />

                            {/* Message */}
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Sporočilo</p>
                                <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                    {inquiry.message}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Previous reply */}
                    {inquiry.reply && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Vaš odgovor</CardTitle>
                                <p className="text-xs text-muted-foreground">{formatDate(inquiry.replied_at)}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                    {inquiry.reply}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reply form */}
                    {canEdit && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Send className="size-4" />
                                    {inquiry.reply ? 'Posodobite odgovor' : 'Napišite odgovor'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={sendReply} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label>Odgovor za <strong>{inquiry.name}</strong> ({inquiry.email})</Label>
                                        <Textarea
                                            value={data.reply}
                                            onChange={e => setData('reply', e.target.value)}
                                            placeholder="Napišite odgovor..."
                                            rows={8}
                                            className="resize-none"
                                        />
                                        {errors.reply && <p className="text-sm text-destructive">{errors.reply}</p>}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">Odgovor bo shranjen v sistemu. Za dejansko pošiljanje emaila konfigurirajte email storitev.</p>
                                        <Button type="submit" disabled={processing || !data.reply.trim()}>
                                            <Send className="size-4 mr-2" />
                                            {processing ? 'Shranjujem...' : (inquiry.reply ? 'Posodobi odgovor' : 'Shrani odgovor')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
