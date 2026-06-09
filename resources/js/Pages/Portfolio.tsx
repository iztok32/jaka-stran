import { useEffect, useState } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { PageProps } from '@/types'

interface Photo {
    id: number
    url: string
    preview: string
    thumb: string
}

interface PortfolioData {
    slug: string
    title: string
    excerpt?: string | null
    photos: Photo[]
}

interface Watermark {
    enabled: boolean
    url?: string | null
    opacity: number
    position: string
}

interface Props extends PageProps {
    portfolio: PortfolioData
    watermark: Watermark
}

function watermarkPosition(position: string): React.CSSProperties {
    const pad = '10px'
    const positions: Record<string, React.CSSProperties> = {
        'bottom-right':  { bottom: pad, right: pad },
        'bottom-left':   { bottom: pad, left: pad },
        'bottom-center': { bottom: pad, left: '50%', transform: 'translateX(-50%)' },
        'top-right':     { top: pad, right: pad },
        'top-left':      { top: pad, left: pad },
        'top-center':    { top: pad, left: '50%', transform: 'translateX(-50%)' },
        'center':        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    }
    return positions[position] ?? positions['bottom-right']
}

function WatermarkOverlay({ watermark, size = '25%' }: { watermark: Watermark; size?: string }) {
    if (!watermark.enabled || !watermark.url) return null
    return (
        <img
            src={watermark.url}
            style={{
                position: 'absolute',
                maxWidth: size,
                maxHeight: size,
                objectFit: 'contain',
                opacity: watermark.opacity / 100,
                pointerEvents: 'none',
                userSelect: 'none',
                ...watermarkPosition(watermark.position),
            }}
            draggable={false}
        />
    )
}

export default function Portfolio({ portfolio, watermark }: Props) {
    const { auth } = usePage<Props>().props
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

    // Keyboard: lightbox navigation + block Ctrl+S / Ctrl+U
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
                e.preventDefault()
                return
            }
            if (lightboxIdx === null) return
            if (e.key === 'Escape') setLightboxIdx(null)
            if (e.key === 'ArrowRight') setLightboxIdx(i => i === null ? null : (i + 1) % portfolio.photos.length)
            if (e.key === 'ArrowLeft')  setLightboxIdx(i => i === null ? null : (i - 1 + portfolio.photos.length) % portfolio.photos.length)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [lightboxIdx, portfolio.photos.length])

    useEffect(() => {
        document.body.style.overflow = lightboxIdx !== null ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [lightboxIdx])

    const prev = () => setLightboxIdx(i => i === null ? null : (i - 1 + portfolio.photos.length) % portfolio.photos.length)
    const next = () => setLightboxIdx(i => i === null ? null : (i + 1) % portfolio.photos.length)

    return (
        <>
            <Head title={`${portfolio.title} — Jaka Vozlič Photography`} />
            <div className="lp" style={{ cursor: 'default' }}>

                {/* Nav */}
                <nav style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 40px', height: '64px',
                    borderBottom: '0.5px solid var(--lp-line)',
                    background: 'rgba(7,7,7,0.92)',
                    backdropFilter: 'blur(12px)',
                }}>
                    <a href="/" style={{
                        fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontSize: '20px',
                        fontWeight: 300, color: 'var(--lp-text)', letterSpacing: '0.04em', textDecoration: 'none',
                    }}>
                        J. <span style={{ color: 'var(--lp-gold)' }}>Vozlič</span>
                    </a>
                    <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                        <a href="/#storitve" style={{
                            fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase',
                            color: 'var(--lp-text-dim)', textDecoration: 'none', transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-text)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-dim)')}>
                            ← Storitve
                        </a>
                        {auth?.user
                            ? <a href={route('dashboard')} style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lp-text-dim)', textDecoration: 'none' }}>Admin</a>
                            : null
                        }
                    </div>
                </nav>

                {/* Header */}
                <div style={{
                    paddingTop: '64px',
                    padding: '100px 60px 56px',
                    borderBottom: '0.5px solid var(--lp-line)',
                }}>
                    <div style={{
                        fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: 'var(--lp-gold)', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                        <span style={{ width: '20px', height: '0.5px', background: 'var(--lp-gold)', display: 'block' }} />
                        Portfolio
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontWeight: 300,
                        fontSize: 'clamp(32px, 5vw, 60px)', color: 'var(--lp-text)',
                        lineHeight: 1.1, marginBottom: '20px',
                    }}>
                        {portfolio.title}
                    </h1>
                    {portfolio.excerpt && (
                        <p style={{ fontSize: '11px', color: 'var(--lp-text-dim)', maxWidth: '580px', lineHeight: 1.9 }}>
                            {portfolio.excerpt}
                        </p>
                    )}
                    <div style={{ marginTop: '20px', fontSize: '9px', color: 'var(--lp-text-faint)', letterSpacing: '0.12em' }}>
                        {portfolio.photos.length} fotografij
                    </div>
                </div>

                {/* Photo masonry grid */}
                <div
                    style={{
                        columnCount: 3,
                        columnGap: '2px',
                        padding: '2px',
                        background: 'var(--lp-bg)',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                    }}
                    onContextMenu={e => e.preventDefault()}
                >
                    {portfolio.photos.map((photo, idx) => (
                        <div
                            key={photo.id}
                            onClick={() => setLightboxIdx(idx)}
                            style={{
                                breakInside: 'avoid',
                                marginBottom: '2px',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'block',
                            }}
                        >
                            <img
                                src={photo.preview}
                                loading="lazy"
                                draggable={false}
                                style={{
                                    width: '100%', display: 'block',
                                    transition: 'transform 0.45s ease, filter 0.45s ease',
                                    filter: 'brightness(0.92)',
                                    WebkitUserDrag: 'none' as any,
                                    pointerEvents: 'none',
                                }}
                            />
                            {/* Transparent intercept overlay — catches right-click instead of <img> */}
                            <div
                                style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                                onContextMenu={e => e.preventDefault()}
                                onMouseEnter={e => {
                                    const img = e.currentTarget.previousElementSibling as HTMLImageElement
                                    if (img) { img.style.transform = 'scale(1.03)'; img.style.filter = 'brightness(1)' }
                                }}
                                onMouseLeave={e => {
                                    const img = e.currentTarget.previousElementSibling as HTMLImageElement
                                    if (img) { img.style.transform = 'scale(1)'; img.style.filter = 'brightness(0.92)' }
                                }}
                            />
                            <WatermarkOverlay watermark={watermark} size="28%" />
                        </div>
                    ))}
                </div>

                {portfolio.photos.length === 0 && (
                    <div style={{ padding: '80px 60px', textAlign: 'center', fontSize: '11px', color: 'var(--lp-text-faint)', letterSpacing: '0.1em' }}>
                        Ta portfolio trenutno še ne vsebuje fotografij.
                    </div>
                )}

                {/* Footer */}
                <div style={{ borderTop: '0.5px solid var(--lp-line)', padding: '24px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontSize: '14px', color: 'var(--lp-text-dim)' }}>
                        Jaka Vozlič Photography
                    </div>
                    <a href="/#storitve" style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lp-text-faint)', textDecoration: 'none' }}>
                        ← Nazaj na storitve
                    </a>
                </div>

                {/* Lightbox */}
                {lightboxIdx !== null && (
                    <div
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200,
                            background: 'rgba(0,0,0,0.96)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            userSelect: 'none', WebkitUserSelect: 'none',
                        }}
                        onClick={() => setLightboxIdx(null)}
                        onContextMenu={e => e.preventDefault()}
                    >
                        {/* Image + watermark wrapper — shows preview, not full-res */}
                        <div
                            style={{ position: 'relative', display: 'inline-flex' }}
                            onClick={e => e.stopPropagation()}
                            onContextMenu={e => e.preventDefault()}
                        >
                            <img
                                src={portfolio.photos[lightboxIdx].preview}
                                draggable={false}
                                style={{
                                    maxHeight: '92vh', maxWidth: '90vw',
                                    objectFit: 'contain', display: 'block',
                                    WebkitUserDrag: 'none' as any,
                                    pointerEvents: 'none',
                                }}
                            />
                            {/* Transparent overlay over lightbox image */}
                            <div
                                style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                                onContextMenu={e => e.preventDefault()}
                            />
                            <WatermarkOverlay watermark={watermark} size="20%" />
                        </div>

                        <button onClick={e => { e.stopPropagation(); prev() }} style={{
                            position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '2px',
                            color: 'rgba(255,255,255,0.8)', fontSize: '28px', width: '48px', height: '56px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>‹</button>

                        <button onClick={e => { e.stopPropagation(); next() }} style={{
                            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '2px',
                            color: 'rgba(255,255,255,0.8)', fontSize: '28px', width: '48px', height: '56px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>›</button>

                        <button onClick={() => setLightboxIdx(null)} style={{
                            position: 'absolute', top: '20px', right: '20px',
                            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '2px',
                            color: 'rgba(255,255,255,0.7)', fontSize: '20px', width: '40px', height: '40px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>×</button>

                        <div style={{
                            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                            fontSize: '9px', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.35)',
                            fontFamily: 'var(--lp-mono)',
                        }}>
                            {lightboxIdx + 1} / {portfolio.photos.length}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
