import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import {
    Bold, Italic, UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Quote, Minus, Link as LinkIcon,
    Undo, Redo, Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TipTapEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    onImageUpload?: (file: File) => Promise<string>
}

function ToolbarButton({
    onClick,
    isActive,
    title,
    children,
}: {
    onClick: () => void
    isActive?: boolean
    title: string
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                'p-1.5 rounded hover:bg-muted transition-colors',
                isActive && 'bg-muted text-primary'
            )}
        >
            {children}
        </button>
    )
}

function EditorToolbar({ editor, onImageUpload }: { editor: Editor; onImageUpload?: (file: File) => Promise<string> }) {
    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)
        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    const handleImageClick = () => {
        if (onImageUpload) {
            // Existing article — upload file to server
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/jpeg,image/png,image/webp,image/gif'
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) return
                const url = await onImageUpload(file)
                if (url) editor.chain().focus().setImage({ src: url }).run()
            }
            input.click()
        } else {
            // New article — no ID yet, offer URL input instead
            const url = window.prompt('Vnesite URL slike\n(Nalaganje slik je možno po shranitvi članka)')
            if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run()
        }
    }

    return (
        <div className="flex flex-wrap gap-0.5 border-b p-1.5 bg-muted/30">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                <Undo className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                <Redo className="size-4" />
            </ToolbarButton>

            <div className="w-px bg-border mx-1" />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                <Bold className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                <Italic className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                <UnderlineIcon className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
                <Strikethrough className="size-4" />
            </ToolbarButton>

            <div className="w-px bg-border mx-1" />

            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align left">
                <AlignLeft className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align center">
                <AlignCenter className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align right">
                <AlignRight className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
                <AlignJustify className="size-4" />
            </ToolbarButton>

            <div className="w-px bg-border mx-1" />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
                <List className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered list">
                <ListOrdered className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
                <Quote className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                <Minus className="size-4" />
            </ToolbarButton>

            <div className="w-px bg-border mx-1" />

            <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Link">
                <LinkIcon className="size-4" />
            </ToolbarButton>
            <ToolbarButton onClick={handleImageClick} title="Image">
                <ImageIcon className="size-4" />
            </ToolbarButton>

            <div className="w-px bg-border mx-1" />

            {([1, 2, 3] as const).map(level => (
                <ToolbarButton
                    key={level}
                    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                    isActive={editor.isActive('heading', { level })}
                    title={`Heading ${level}`}
                >
                    <span className="text-xs font-bold">H{level}</span>
                </ToolbarButton>
            ))}
        </div>
    )
}

export function TipTapEditor({ value, onChange, placeholder, className, onImageUpload }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
            Image.configure({ HTMLAttributes: { class: 'max-w-full rounded' } }),
            Placeholder.configure({ placeholder: placeholder ?? 'Začnite pisati...' }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    return (
        <div className={cn('border rounded-md overflow-hidden bg-background', className)}>
            <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
            <EditorContent
                editor={editor}
                className="min-h-[300px] p-3 [&_.ProseMirror]:min-h-[280px]"
            />
        </div>
    )
}
