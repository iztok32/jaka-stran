import { useRef, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Label } from '@/Components/ui/label'
import { Switch } from '@/Components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { Input } from '@/Components/ui/input'
import { ImagePlus, Loader2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Settings {
    watermark_image: string | null
    watermark_enabled: boolean
    watermark_opacity: number
    watermark_position: string
}

interface Props extends PageProps {
    settings: Settings
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

    const getCsrf = () =>
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''

    const uploadFile = async (file: File) => {
        if (!canEdit) return
        setUploading(true)
        const formData = new FormData()
        formData.append('image', file)
        try {
            await fetch(route('settings.watermark.store'), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': getCsrf() },
                credentials: 'same-origin',
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
        await fetch(route('settings.watermark.delete'), {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': getCsrf() },
            credentials: 'same-origin',
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

export default function SettingsIndex({ settings }: Props) {
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

                </div>
            </div>
        </AuthenticatedLayout>
    )
}
