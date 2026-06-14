import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link } from '@inertiajs/react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/table'
import { Eye, Users, MessageSquare, Image as ImageIcon } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

interface ChartPoint {
    date: string
    views: number
    visitors: number
}

interface TopGallery {
    id: number
    title: string
    slug: string | null
    views: number
}

interface TopPhoto {
    id: number
    thumb: string
    gallery_title: string | null
    views: number
}

interface RecentInquiry {
    id: number
    name: string
    email: string
    project_type?: string | null
    status: 'new' | 'read' | 'replied' | 'archived'
    created_at: string
}

interface Props {
    stats: {
        views_30d: number
        visitors_30d: number
        views_total: number
        visitors_total: number
        inquiries_total: number
        inquiries_30d: number
        inquiries_new: number
    }
    chart: ChartPoint[]
    viewsByType: Record<string, number>
    topGalleries: TopGallery[]
    topPhotos: TopPhoto[]
    inquiriesByStatus: Record<string, number>
    recentInquiries: RecentInquiry[]
}

function StatusBadge({ status }: { status: RecentInquiry['status'] }) {
    const map = {
        new:      { label: 'Novo',        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        read:     { label: 'Prebrano',    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        replied:  { label: 'Odgovorjeno', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        archived: { label: 'Arhivirano',  className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    }
    const { label, className } = map[status]
    return <Badge className={cn('font-normal', className)}>{label}</Badge>
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: number | string; sub?: string }) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-2xl font-semibold leading-none">{value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{label}</div>
                    {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
                </div>
            </CardContent>
        </Card>
    )
}

function formatShortDate(d: string) {
    const date = new Date(d)
    return date.toLocaleDateString('sl-SI', { day: 'numeric', month: 'numeric' })
}

export default function Dashboard({ stats, chart, topGalleries, topPhotos, recentInquiries }: Props) {
    const { t } = useTranslation()

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Dashboard')}
                </h2>
            }
        >
            <Head title={t('Dashboard')} />

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Eye} label="Ogledi strani (30 dni)" value={stats.views_30d} sub={`Skupaj: ${stats.views_total}`} />
                    <StatCard icon={Users} label="Unikatni obiskovalci (30 dni)" value={stats.visitors_30d} sub={`Skupaj: ${stats.visitors_total}`} />
                    <StatCard icon={MessageSquare} label="Povpraševanja (30 dni)" value={stats.inquiries_30d} sub={`Skupaj: ${stats.inquiries_total}`} />
                    <StatCard icon={MessageSquare} label="Nova povpraševanja" value={stats.inquiries_new} />
                </div>

                {/* Visits chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Obiski v zadnjih 30 dneh</CardTitle>
                        <CardDescription>Ogledi strani in unikatni obiskovalci po dnevih</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} minTickGap={20} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip labelFormatter={formatShortDate} />
                                <Area type="monotone" dataKey="views" name="Ogledi" stroke="var(--primary)" fill="url(#colorViews)" strokeWidth={2} />
                                <Area type="monotone" dataKey="visitors" name="Obiskovalci" stroke="#22c55e" fill="url(#colorVisitors)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Top galleries */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Najbolj obiskane galerije</CardTitle>
                            <CardDescription>Zadnjih 30 dni</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topGalleries.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Ni še podatkov.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {topGalleries.map((g, idx) => (
                                        <li key={g.id} className="flex items-center gap-3">
                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                                {idx + 1}
                                            </span>
                                            {g.slug ? (
                                                <a href={`/galerija/${g.slug}`} target="_blank" rel="noreferrer" className="flex-1 truncate text-sm hover:underline">
                                                    {g.title}
                                                </a>
                                            ) : (
                                                <span className="flex-1 truncate text-sm">{g.title}</span>
                                            )}
                                            <span className="text-sm font-medium tabular-nums text-muted-foreground">{g.views}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top photos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Najbolj ogledane fotografije</CardTitle>
                            <CardDescription>Zadnjih 30 dni · ogledi v lightboxu</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topPhotos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Ni še podatkov.</p>
                            ) : (
                                <div className="grid grid-cols-4 gap-2">
                                    {topPhotos.map(p => (
                                        <div key={p.id} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                                            <img src={p.thumb} alt={p.gallery_title ?? ''} className="size-full object-cover" />
                                            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-1 bg-black/60 px-1.5 py-0.5">
                                                <span className="truncate text-[10px] text-white/80">{p.gallery_title ?? ''}</span>
                                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-white">
                                                    <ImageIcon className="size-3" /> {p.views}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent inquiries */}
                <Card>
                    <CardHeader>
                        <CardTitle>Zadnja povpraševanja</CardTitle>
                        <CardDescription>5 najnovejših sporočil iz kontaktnega obrazca</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentInquiries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Ni še povpraševanj.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ime</TableHead>
                                        <TableHead>E-pošta</TableHead>
                                        <TableHead>Tip projekta</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Datum</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentInquiries.map(i => (
                                        <TableRow key={i.id} className={i.status === 'new' ? 'font-medium' : ''}>
                                            <TableCell>
                                                <Link href={`/contact-inquiries/${i.id}`} className="hover:underline">{i.name}</Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{i.email}</TableCell>
                                            <TableCell className="text-muted-foreground">{i.project_type ?? '—'}</TableCell>
                                            <TableCell><StatusBadge status={i.status} /></TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {new Date(i.created_at).toLocaleDateString('sl-SI', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    )
}
