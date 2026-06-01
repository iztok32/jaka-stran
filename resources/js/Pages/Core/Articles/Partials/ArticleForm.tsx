import { useForm, router } from '@inertiajs/react'
import { useTranslation } from '@/lib/i18n'
import { Article } from '@/types'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Switch } from '@/Components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { DatePicker } from '@/Components/ui/date-picker'
import { TipTapEditor } from '@/Components/TipTapEditor'
import { X, Image as ImageIcon, Globe, Lock } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ArticleFormProps {
    article?: Article | null
    onSuccess?: () => void
}

export default function ArticleForm({ article, onSuccess }: ArticleFormProps) {
    const { t } = useTranslation()
    const [featuredPreview, setFeaturedPreview] = useState<string>(article?.featured_image || '')
    const featuredInputRef = useRef<HTMLInputElement>(null)
    // File is stored in a ref — Inertia useForm serializes state with JSON.stringify,
    // which converts File objects to {}, so files must stay outside useForm.
    const featuredFileRef = useRef<File | null>(null)

    const { data, setData, errors, processing, reset } = useForm({
        title:        article?.title ?? '',
        slug:         article?.slug ?? '',
        excerpt:      article?.excerpt ?? '',
        content:      article?.content ?? '',
        status:       (article?.status ?? 'draft') as 'draft' | 'published' | 'archived',
        is_public:    article?.is_public ?? true,
        published_at: article?.published_at ? article.published_at.slice(0, 10) : '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('title',        data.title)
        formData.append('slug',         data.slug)
        formData.append('excerpt',      data.excerpt)
        formData.append('content',      data.content)
        formData.append('status',       data.status)
        formData.append('is_public',    data.is_public ? '1' : '0')
        formData.append('published_at', data.published_at)
        if (featuredFileRef.current) {
            formData.append('featured_image', featuredFileRef.current)
        }

        if (article) {
            formData.append('_method', 'PUT')
            router.post(route('articles.update', article.id), formData, {
                onSuccess: () => { reset(); onSuccess?.() },
                forceFormData: true,
            })
        } else {
            router.post(route('articles.store'), formData, {
                onSuccess: () => {
                    reset()
                    featuredFileRef.current = null
                    setFeaturedPreview('')
                    onSuccess?.()
                },
                forceFormData: true,
            })
        }
    }

    const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        featuredFileRef.current = file
        const reader = new FileReader()
        reader.onload = (ev) => setFeaturedPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
    }

    const handleImageUploadForEditor = async (file: File): Promise<string> => {
        if (!article) return ''
        const fd = new FormData()
        fd.append('file', file)
        fd.append('collection', 'gallery')
        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
        const res = await fetch(route('articles.media.upload', article.id), {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken },
            credentials: 'same-origin',
            body: fd,
        })
        if (!res.ok) return ''
        const data = await res.json()
        return data.url ?? ''
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="title">{t('Title')} <span className="text-destructive">*</span></Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder={t('Article title')}
                    autoFocus
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
                    placeholder="npr. moj-prvi-clanek"
                    className="font-mono text-sm"
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
            </div>

            {/* Status + Publish date row */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-4">
                <div className="space-y-1.5">
                    <Label>{t('Status')}</Label>
                    <Select value={data.status} onValueChange={v => setData('status', v as typeof data.status)}>
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

                <div className="flex flex-col gap-1.5">
                    <Label>{t('Publish date')}</Label>
                    <DatePicker
                        value={data.published_at}
                        onChange={v => setData('published_at', v)}
                        placeholder={t('Select date')}
                    />
                    {errors.published_at && <p className="text-sm text-destructive">{errors.published_at}</p>}
                </div>
            </div>

            {/* Public access */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{t('Public access')}</Label>
                    <p className="text-xs text-muted-foreground">
                        {data.is_public
                            ? t('Visible without login')
                            : t('Requires login')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {data.is_public
                        ? <Globe className="size-4 text-green-600 dark:text-green-400" />
                        : <Lock className="size-4 text-orange-600 dark:text-orange-400" />}
                    <Switch
                        checked={data.is_public}
                        onCheckedChange={v => setData('is_public', v)}
                    />
                </div>
            </div>

            {/* Featured image */}
            <div className="space-y-1.5">
                <Label>{t('Featured image')}</Label>
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        "hover:border-primary/50",
                        featuredPreview ? "p-2" : "p-6"
                    )}
                    onClick={() => featuredInputRef.current?.click()}
                >
                    {featuredPreview ? (
                        <div className="relative">
                            <img
                                src={featuredPreview}
                                alt=""
                                className="max-h-52 w-full rounded object-cover"
                            />
                            <button
                                type="button"
                                className="absolute top-2 right-2 bg-background/90 rounded-full p-1 shadow hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                onClick={e => {
                                    e.stopPropagation()
                                    setFeaturedPreview('')
                                    featuredFileRef.current = null
                                    if (featuredInputRef.current) featuredInputRef.current.value = ''
                                }}
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageIcon className="size-10 opacity-40" />
                            <span className="text-sm">{t('Click to upload featured image')}</span>
                            <span className="text-xs opacity-60">JPG, PNG, WEBP</span>
                        </div>
                    )}
                </div>
                <input
                    ref={featuredInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFeaturedImageChange}
                />
                {errors.featured_image && <p className="text-sm text-destructive">{errors.featured_image}</p>}
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
                <Label htmlFor="excerpt">{t('Excerpt')}</Label>
                <Textarea
                    id="excerpt"
                    value={data.excerpt}
                    onChange={e => setData('excerpt', e.target.value)}
                    placeholder={t('Short description of the article')}
                    rows={3}
                    className="resize-none"
                />
                {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt}</p>}
            </div>

            {/* Content */}
            <div className="space-y-1.5">
                <Label>{t('Content')}</Label>
                <TipTapEditor
                    value={data.content}
                    onChange={v => setData('content', v)}
                    placeholder={t('Write article content here...')}
                    onImageUpload={article ? handleImageUploadForEditor : undefined}
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="submit" disabled={processing} className="min-w-28">
                    {processing
                        ? t('Saving...')
                        : article
                            ? t('Update Article')
                            : t('Create Article')}
                </Button>
            </div>
        </form>
    )
}
