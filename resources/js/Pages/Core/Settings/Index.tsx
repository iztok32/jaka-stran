import { useCallback, useRef, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Label } from '@/Components/ui/label'
import { Switch } from '@/Components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { Input } from '@/Components/ui/input'
import { ImagePlus, Instagram, Loader2, Mail, Save, Trash2, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api'

interface Settings {
    watermark_image: string | null
    watermark_enabled: boolean
    watermark_opacity: number
    watermark_position: string
    instagram_url: string | null
    facebook_url: string | null
    contact_email: string | null
    contact_phone: string | null
}

interface PhotographerPhotoItem {
    id: number
    url: string
    original_name: string
    usage: string | null
    sort_order: number
}

interface Props extends PageProps {
    settings: Settings
    photographerPhotos: PhotographerPhotoItem[]
}

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

function WatermarkUpload({
    currentUrl,
    canEdit,
}: {
    currentUrl: string | null
    canEdit: boolean
}) {
    const { t } = useTranslation()
    const [preview, setPreview]     = useState<string | null>(currentUrl)
    const [uploading, setUploading] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const inputRef                  = useRef<HTMLInputElement>(null)

    const uploadFile = async (file: File) => {
        if (!canEdit) return
        setUploading(true)
        const formData = new FormData()
        formData.append('image', file)
        try {
            await apiFetch(route('settings.watermark.store'), {
                method: 'POST',
                body: formData,
            })
            setPreview(URL.createObjectURL(file))
            router.reload({ only: ['settings'] })
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async () => {
        if (!canEdit) return
        await apiFetch(route('settings.watermark.delete'), {
            method: 'DELETE',
        })
        setPreview(null)
        router.reload({ only: ['settings'] })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file?.type.startsWith('image/')) uploadFile(file)
    }

    return (
        <div className="space-y-3">
            {preview ? (
                <div className="relative inline-block">
                    <div className="rounded-lg border overflow-hidden bg-muted/40 p-3">
                        <img
                            src={preview}
                            alt="Watermark"
                            className="max-h-32 max-w-xs object-contain"
                        />
                    </div>
                    {canEdit && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow hover:bg-destructive/80 transition-colors"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            ) : (
                canEdit && (
                    <div
                        className={cn(
                            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                            isDragOver
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                    >
                        {uploading ? (
                            <Loader2 className="size-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                        ) : (
                            <ImagePlus className={cn('size-8 mx-auto mb-2', isDragOver ? 'text-primary' : 'text-muted-foreground/50')} />
                        )}
                        <p className="text-sm text-muted-foreground">
                            {uploading ? t('Uploading...') : t('Drag & drop or click to upload watermark')}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">PNG, WEBP · priporočamo PNG s prosojnim ozadjem · max 5 MB</p>
                    </div>
                )
            )}

            {canEdit && preview && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <ImagePlus className="size-4 mr-2" />}
                    {t('Replace watermark')}
                </Button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file)
                    e.target.value = ''
                }}
            />
        </div>
    )
}

function BooleanSetting({ settingKey, value, label, description, canEdit }: {
    settingKey: string
    value: boolean
    label: string
    description?: string
    canEdit: boolean
}) {
    const [current, setCurrent] = useState(value)

    const toggle = (v: boolean) => {
        setCurrent(v)
        router.patch(route('settings.update', settingKey), { value: v }, { preserveScroll: true })
    }

    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <Switch checked={current} onCheckedChange={toggle} disabled={!canEdit} />
        </div>
    )
}

function IntegerSetting({ settingKey, value, label, description, min, max, canEdit }: {
    settingKey: string
    value: number
    label: string
    description?: string
    min?: number
    max?: number
    canEdit: boolean
}) {
    const { t } = useTranslation()
    const [current, setCurrent] = useState(String(value))

    const save = () => {
        router.patch(route('settings.update', settingKey), { value: Number(current) }, { preserveScroll: true })
    }

    return (
        <div className="flex items-end justify-between gap-4 py-3">
            <div className="flex-1">
                <p className="text-sm font-medium mb-1">{label}</p>
                {description && <p className="text-xs text-muted-foreground mb-2">{description}</p>}
                <Input
                    type="number"
                    value={current}
                    onChange={e => setCurrent(e.target.value)}
                    min={min}
                    max={max}
                    className="w-28"
                    disabled={!canEdit}
                />
            </div>
            {canEdit && (
                <Button size="sm" variant="outline" onClick={save}>
                    <Save className="size-3.5 mr-1.5" />{t('Save')}
                </Button>
            )}
        </div>
    )
}

function SelectSetting({ settingKey, value, label, description, options, canEdit }: {
    settingKey: string
    value: string
    label: string
    description?: string
    options: { value: string; label: string }[]
    canEdit: boolean
}) {
    const onChange = (v: string) => {
        router.patch(route('settings.update', settingKey), { value: v }, { preserveScroll: true })
    }

    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <Select value={value} onValueChange={onChange} disabled={!canEdit}>
                <SelectTrigger className="w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

const USAGE_OPTIONS = [
    { value: 'about',   label: 'O meni — ozadje' },
    { value: 'hero',    label: 'Hero sekcija' },
    { value: 'contact', label: 'Kontakt sekcija' },
]

function PhotographerPhotos({ photos: initialPhotos, canEdit }: {
    photos: PhotographerPhotoItem[]
    canEdit: boolean
}) {
    const { t } = useTranslation()
    const [photos, setPhotos]     = useState<PhotographerPhotoItem[]>(initialPhotos)
    const [uploading, setUploading] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const uploadFiles = useCallback(async (files: File[]) => {
        if (!canEdit || uploading) return
        setUploading(true)
        const formData = new FormData()
        files.forEach(f => formData.append('photos[]', f))
        try {
            const res = await apiFetch(route('settings.photographer-photos.store'), {
                method: 'POST',
                body: formData,
            })
            if (res.ok) {
                const data = await res.json() as { photos: PhotographerPhotoItem[] }
                setPhotos(prev => [...prev, ...data.photos])
            }
        } finally {
            setUploading(false)
        }
    }, [canEdit, uploading])

    const handleUsageChange = async (photoId: number, usage: string) => {
        const newUsage = usage === 'none' ? null : usage
        // Optimistic update — clear old photo with same usage
        setPhotos(prev => prev.map(p => ({
            ...p,
            usage: p.usage === newUsage && p.id !== photoId ? null :
                   p.id === photoId ? newUsage : p.usage,
        })))
        await apiFetch(route('settings.photographer-photos.usage', photoId), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usage: newUsage }),
        })
    }

    const handleDelete = async (photoId: number, filename: string) => {
        setPhotos(prev => prev.filter(p => p.id !== photoId))
        await apiFetch(route('settings.photographer-photos.delete', photoId), {
            method: 'DELETE',
        })
    }

    return (
        <div className="space-y-4">
            {/* Upload zone */}
            {canEdit && (
                <div
                    className={cn(
                        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                        isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={e => {
                        e.preventDefault(); setIsDragOver(false)
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
                        if (files.length) uploadFiles(files)
                    }}
                >
                    {uploading
                        ? <Loader2 className="size-7 mx-auto mb-2 animate-spin text-muted-foreground" />
                        : <ImagePlus className={cn('size-7 mx-auto mb-2', isDragOver ? 'text-primary' : 'text-muted-foreground/50')} />
                    }
                    <p className="text-sm text-muted-foreground">
                        {uploading ? t('Uploading...') : t('Drag & drop or click to upload')}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WEBP · max 10 MB</p>
                    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                        onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) uploadFiles(f); e.target.value = '' }} />
                </div>
            )}

            {/* Photos grid */}
            {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map(photo => (
                        <div key={photo.id} className="group relative rounded-lg overflow-hidden border bg-muted aspect-[3/4]">
                            <img src={photo.url} alt={photo.original_name} className="w-full h-full object-cover" />

                            {/* Usage badge */}
                            {photo.usage && (
                                <div className="absolute top-2 left-2">
                                    <Badge className="text-[10px] bg-black/70 text-white border-0 py-0.5">
                                        {USAGE_OPTIONS.find(o => o.value === photo.usage)?.label ?? photo.usage}
                                    </Badge>
                                </div>
                            )}

                            {/* Delete button */}
                            {canEdit && (
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
                                    onClick={() => handleDelete(photo.id, photo.original_name)}
                                >
                                    <Trash2 className="size-3" />
                                </button>
                            )}

                            {/* Usage selector */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="text-[10px] text-white/60 truncate mb-1">{photo.original_name}</p>
                                {canEdit ? (
                                    <Select
                                        value={photo.usage ?? 'none'}
                                        onValueChange={v => handleUsageChange(photo.id, v)}
                                    >
                                        <SelectTrigger className="h-7 text-[11px] bg-black/50 border-white/20 text-white [&>svg]:text-white">
                                            <SelectValue placeholder="Brez namena" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">— Brez namena</SelectItem>
                                            {USAGE_OPTIONS.map(o => (
                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-[11px] text-white/80">
                                        {photo.usage ? USAGE_OPTIONS.find(o => o.value === photo.usage)?.label : '—'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {photos.length === 0 && !canEdit && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('No photos uploaded.')}</p>
            )}
        </div>
    )
}

function TextSetting({ settingKey, value, label, placeholder, type = 'url', canEdit }: {
    settingKey: string
    value: string
    label: string
    placeholder?: string
    type?: 'url' | 'email' | 'tel' | 'text'
    canEdit: boolean
}) {
    const { t } = useTranslation()
    const [current, setCurrent] = useState(value)

    const save = () => {
        router.patch(route('settings.update', settingKey), { value: current }, { preserveScroll: true })
    }

    return (
        <div className="flex items-end justify-between gap-4 py-3">
            <div className="flex-1 space-y-1.5">
                <Label className="text-sm font-medium">{label}</Label>
                <Input
                    type={type}
                    value={current}
                    onChange={e => setCurrent(e.target.value)}
                    placeholder={placeholder}
                    disabled={!canEdit}
                    className="font-mono text-sm"
                />
            </div>
            {canEdit && (
                <Button size="sm" variant="outline" onClick={save} className="shrink-0">
                    <Save className="size-3.5 mr-1.5" />{t('Save')}
                </Button>
            )}
        </div>
    )
}

export default function SettingsIndex({ settings, photographerPhotos }: Props) {
    const { t } = useTranslation()
    const { auth } = usePage<Props>().props
    const canEdit = auth.user.permissions?.includes('settings.edit') ?? false

    const positionOptions: { value: string; label: string }[] = [
        { value: 'top-left',     label: t('Top left') },
        { value: 'top-right',    label: t('Top right') },
        { value: 'bottom-left',  label: t('Bottom left') },
        { value: 'bottom-right', label: t('Bottom right') },
        { value: 'center',       label: t('Center') },
    ]

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl leading-tight">{t('Settings')}</h2>}>
            <Head title={t('Settings')} />

            <div className="py-6">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Watermark */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Watermark')}</CardTitle>
                            <CardDescription>
                                {t('Watermark image displayed on photos. Use PNG with transparent background for best results.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Upload */}
                            <div className="space-y-1.5">
                                <Label>{t('Watermark image')}</Label>
                                <WatermarkUpload currentUrl={settings.watermark_image} canEdit={canEdit} />
                            </div>

                            <div className="border-t pt-4 divide-y">
                                <BooleanSetting
                                    settingKey="watermark_enabled"
                                    value={settings.watermark_enabled}
                                    label={t('Enable watermark')}
                                    description={t('Apply watermark to gallery photos')}
                                    canEdit={canEdit}
                                />
                                <SelectSetting
                                    settingKey="watermark_position"
                                    value={settings.watermark_position}
                                    label={t('Position')}
                                    description={t('Where to place the watermark on the photo')}
                                    options={positionOptions}
                                    canEdit={canEdit}
                                />
                                <IntegerSetting
                                    settingKey="watermark_opacity"
                                    value={settings.watermark_opacity}
                                    label={t('Opacity') + ' (%)'}
                                    description={t('Watermark transparency: 0 = invisible, 100 = fully opaque')}
                                    min={0}
                                    max={100}
                                    canEdit={canEdit}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social links */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Instagram className="size-4" />
                                {t('Social networks')}
                            </CardTitle>
                            <CardDescription>
                                {t('Links displayed in the footer and contact section of the landing page.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                <TextSetting
                                    settingKey="instagram_url"
                                    value={settings.instagram_url ?? ''}
                                    label="Instagram"
                                    placeholder="https://www.instagram.com/username"
                                    type="url"
                                    canEdit={canEdit}
                                />
                                <TextSetting
                                    settingKey="facebook_url"
                                    value={settings.facebook_url ?? ''}
                                    label="Facebook"
                                    placeholder="https://www.facebook.com/username"
                                    type="url"
                                    canEdit={canEdit}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="size-4" />
                                {t('Contact info')}
                            </CardTitle>
                            <CardDescription>
                                {t('Email and phone number shown in the contact section of the landing page.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                <TextSetting
                                    settingKey="contact_email"
                                    value={settings.contact_email ?? ''}
                                    label={t('Email')}
                                    placeholder="info@jaka.si"
                                    type="email"
                                    canEdit={canEdit}
                                />
                                <TextSetting
                                    settingKey="contact_phone"
                                    value={settings.contact_phone ?? ''}
                                    label={t('Phone')}
                                    placeholder="+386 41 000 000"
                                    type="tel"
                                    canEdit={canEdit}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Photographer photos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="size-4" />
                                Fotografije fotografa
                            </CardTitle>
                            <CardDescription>
                                Naložite fotografije, ki bodo prikazane na landing page. Za vsako izberite kje bo prikazana.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PhotographerPhotos photos={photographerPhotos} canEdit={canEdit} />
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    )
}
