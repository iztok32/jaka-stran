import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface Tag {
    id?: number
    name: string
    slug?: string
}

interface TagInputProps {
    value: string[]         // current tag names
    onChange: (tags: string[]) => void
    suggestions?: Tag[]     // all available tags for autocomplete
    placeholder?: string
    disabled?: boolean
    className?: string
}

export default function TagInput({
    value,
    onChange,
    suggestions = [],
    placeholder,
    disabled = false,
    className,
}: TagInputProps) {
    const { t } = useTranslation()
    const [input, setInput]           = useState('')
    const [open, setOpen]             = useState(false)
    const inputRef                    = useRef<HTMLInputElement>(null)
    const containerRef                = useRef<HTMLDivElement>(null)

    const filtered = suggestions.filter(
        s => s.name.toLowerCase().includes(input.toLowerCase()) &&
             !value.includes(s.name)
    ).slice(0, 8)

    const addTag = (name: string) => {
        const trimmed = name.trim()
        if (!trimmed || value.includes(trimmed)) return
        onChange([...value, trimmed])
        setInput('')
        setOpen(false)
        inputRef.current?.focus()
    }

    const removeTag = (name: string) => {
        onChange(value.filter(t => t !== name))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            if (input.trim()) addTag(input)
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            removeTag(value[value.length - 1])
        } else if (e.key === 'Escape') {
            setOpen(false)
        } else if (e.key === 'ArrowDown' && open) {
            e.preventDefault()
            const first = containerRef.current?.querySelector<HTMLButtonElement>('[data-suggestion]')
            first?.focus()
        }
    }

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const showDropdown = open && !disabled && (filtered.length > 0 || input.trim().length > 0)

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <div
                className={cn(
                    'flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm',
                    'focus-within:ring-1 focus-within:ring-ring transition-shadow',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                {value.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs font-medium"
                    >
                        {tag}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); removeTag(tag) }}
                                className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </span>
                ))}
                {!disabled && (
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => { setInput(e.target.value); setOpen(true) }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={value.length === 0 ? (placeholder ?? t('Add tags...')) : ''}
                        className="flex-1 min-w-24 bg-transparent outline-none placeholder:text-muted-foreground text-sm py-0.5"
                    />
                )}
            </div>

            {showDropdown && (
                <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
                    <div className="max-h-48 overflow-y-auto py-1">
                        {filtered.map(s => (
                            <button
                                key={s.name}
                                type="button"
                                data-suggestion
                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                onMouseDown={e => { e.preventDefault(); addTag(s.name) }}
                                onKeyDown={e => e.key === 'Enter' && addTag(s.name)}
                            >
                                {s.name}
                            </button>
                        ))}
                        {input.trim() && !suggestions.find(s => s.name.toLowerCase() === input.trim().toLowerCase()) && (
                            <button
                                type="button"
                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
                                onMouseDown={e => { e.preventDefault(); addTag(input) }}
                            >
                                {t('Create')} <span className="font-medium text-foreground">"{input.trim()}"</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
