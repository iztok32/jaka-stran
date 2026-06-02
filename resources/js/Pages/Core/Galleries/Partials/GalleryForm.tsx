import { useEffect, useState } from 'react'
import { useForm, router } from '@inertiajs/react'
import { useTranslation } from '@/lib/i18n'
import { Gallery, GalleryPhoto } from '@/types'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Switch } from '@/Components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { Separator } from '@/Components/ui/separator'
import { DatePicker } from '@/Components/ui/date-picker'
import { Globe, Lock, Images } from 'lucide-react'
import PhotoUploader from './PhotoUploader'

interface GalleryFormProps {
    gallery?: Gallery | null
    canEdit?: boolean
    onSuccess?: () => void
}

export default function GalleryForm({ gallery, canEdit = true, onSuccess }: GalleryFormProps) {
    const { t } = useTranslation()

    const [photos, setPhotos]   = useState<GalleryPhoto[]>(gallery?.photos ?? [])
    const [coverId, setCoverId] = useState<number | null>(gallery?.cover_photo_id ?? null)

    useEffect(() => {
        setPhotos(gallery?.photos ?? [])
        setCoverId(gallery?.cover_photo_id ?? null)
    }, [gallery?.id])

    const { data, setData, errors, processing, reset } = useForm({
        title:        gallery?.title ?? '',
        slug:         gallery?.slug ?? '',
        description:  gallery?.description ?? '',
        status:       (gallery?.status ?? 'draft') as 'draft' | 'published' | 'archived',
        is_public:    gallery?.is_public ?? true,
        gallery_date: gallery?.gallery_date ?? '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('title',        data.title)
        formData.append('slug',         data.slug)
        formData.append('description',  data.description)
        formData.append('status',       data.status)
        formData.append('is_public',    data.is_public ? '1' : '0')
        formData.append('gallery_date', data.gallery_date)

        if (gallery) {
            formData.append('_method', 'PUT')
            router.post(route('galleries.update', gallery.id), formData, {
                onSuccess: () => { reset(); onSuccess?.() },
                forceFormData: true,
            })
        } else {
            router.post(route('galleries.store'), formData, {
                onSuccess: () => { reset(); onSuccess?.() },
                forceFormData: true,
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="title">{t('Title')} <span className="text-destructive">*</span></Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder={t('Gallery title')}
                    autoFocus
                    disabled={!canEdit}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
                <Label htmlFor="slug">
                    {t('Slug')}
                    <span className="ml-1.5 text-xs text-muted-foreground">({t('auto-generated-from-title')})</span>
                </Label>
                <Input
                    id="slug"
                    value={data.slug}
                    onChange={e => setData('slug', e.target.value)}
                    placeholder="npr. porocna-fotografija-2024"
                    className="font-mono text-sm"
                    disabled={!canEdit}
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label htmlFor="description">{t('Description')}</Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    placeholder={t('Short description of the gallery')}
                    rows={3}
                    className="resize-none"
                    disabled={!canEdit}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            {/* Status + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label>{t('Status')}</Label>
                    <Select
                        value={data.status}
                        onValueChange={v => setData('status', v as typeof data.status)}
                        disabled={!canEdit}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                    {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                </div>

                <div className="flex flex-col gap-1.5 items-start">
                    <Label>{t('Gallery date')}</Label>
                    <DatePicker
                        value={data.gallery_date}
                        onChange={v => setData('gallery_date', v)}
                        placeholder={t('Select date')}
                        disabled={!canEdit}
                    />
                    {errors.gallery_date && <p className="text-sm text-destructive">{errors.gallery_date}</p>}
                </div>
            </div>

            {/* Public access */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{t('Public access')}</Label>
                    <p className="text-xs text-muted-foreground">
                        {data.is_public ? t('Visible without login') : t('Requires login')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {data.is_public
                        ? <Globe className="size-4 text-green-600 dark:text-green-400" />
                        : <Lock className="size-4 text-orange-600 dark:text-orange-400" />}
                    <Switch
                        checked={data.is_public}
                        onCheckedChange={v => setData('is_public', v)}
                        disabled={!canEdit}
                    />
                </div>
            </div>

            {/* Submit */}
            {canEdit && (
                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button type="submit" disabled={processing} className="min-w-32">
                        {processing
                            ? t('Saving...')
                            : gallery
                                ? t('Update Gallery')
                                : t('Create Gallery')}
                    </Button>
                </div>
            )}

            {/* Photo uploader — only for existing galleries */}
            {gallery && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Images className="size-4 text-muted-foreground" />
                            <Label className="text-base font-medium">{t('Photos')}</Label>
                            <span className="text-xs text-muted-foreground">({photos.length})</span>
                        </div>
                        <PhotoUploader
                            galleryId={gallery.id}
                            photos={photos}
                            coverId={coverId}
                            onPhotosChange={setPhotos}
                            onCoverChange={setCoverId}
                            canEdit={canEdit}
                        />
                    </div>
                </>
            )}

            {!gallery && (
                <p className="text-xs text-muted-foreground text-center pb-2">
                    {t('Save the gallery first to start uploading photos.')}
                </p>
            )}
        </form>
    )
}
