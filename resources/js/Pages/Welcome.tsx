import { useEffect, useMemo, useRef, useState } from 'react'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { PageProps } from '@/types'

/* ── Types ── */
interface GalleryItem {
    id: number
    title: string
    slug: string
    description?: string | null
    gallery_date?: string | null
    cover?: string | null
    photos_count: number
    tags: string[]
    photos: { id: number; thumb: string; url: string }[]
}

interface HeroArticle {
    title: string
    excerpt?: string | null
    tagline?: string | null
}

interface AboutArticle {
    title: string
    excerpt?: string | null
    content?: string | null
    author?: string | null
}

interface ServiceArticle {
    id: number
    title: string
    excerpt?: string | null
    portfolioSlug?: string
}

interface HeroPhoto {
    url: string
    label: string
}

interface SocialLinks {
    instagram?: string | null
    facebook?: string | null
}

interface ContactInfo {
    email?: string | null
    phone?: string | null
}

interface Props extends PageProps {
    galleries: GalleryItem[]
    allTags: string[]
    heroPhotos: HeroPhoto[]
    stats: { galleries: number; photos: number }
    socialLinks: SocialLinks
    contactInfo: ContactInfo
    photographerPhotos: string[]
    heroArticle?: HeroArticle | null
    aboutArticle?: AboutArticle | null
    serviceArticles: ServiceArticle[]
}

/* ── Cursor hook ── */
function useCursor() {
    const curRef  = useRef<HTMLDivElement>(null)
    const ringRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let mx = 0, my = 0, rx = 0, ry = 0
        let raf: number

        const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
        document.addEventListener('mousemove', onMove)

        const animate = () => {
            if (curRef.current) {
                curRef.current.style.left = mx + 'px'
                curRef.current.style.top  = my + 'px'
            }
            rx += (mx - rx) * 0.14
            ry += (my - ry) * 0.14
            if (ringRef.current) {
                ringRef.current.style.left = rx + 'px'
                ringRef.current.style.top  = ry + 'px'
            }
            raf = requestAnimationFrame(animate)
        }
        raf = requestAnimationFrame(animate)

        return () => {
            document.removeEventListener('mousemove', onMove)
            cancelAnimationFrame(raf)
        }
    }, [])

    return { curRef, ringRef }
}

/* ── Scroll reveal hook ── */
function useScrollReveal() {
    useEffect(() => {
        const els = document.querySelectorAll('.lp-reveal')
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible') })
        }, { threshold: 0.12 })
        els.forEach(el => obs.observe(el))
        return () => obs.disconnect()
    }, [])
}

/* ── Nav ── */
function Nav({ hasUser }: { hasUser: boolean }) {
    const [activeSection, setActiveSection] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            const sections = ['portfolio', 'o-meni', 'storitve', 'kontakt']
            let current = ''
            sections.forEach(id => {
                const el = document.getElementById(id)
                if (el && window.scrollY >= el.offsetTop - 100) current = id
            })
            setActiveSection(current)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close the mobile menu on viewport changes (e.g. orientation switch back to desktop)
    useEffect(() => {
        if (!menuOpen) return
        const close = () => setMenuOpen(false)
        window.addEventListener('resize', close)
        return () => window.removeEventListener('resize', close)
    }, [menuOpen])

    const isActive = (href: string) => href === '#' + activeSection
    const navLinks: [string, string][] = [['#portfolio', 'Galerija'], ['#o-meni', 'O meni'], ['#storitve', 'Storitve'], ['#kontakt', 'Kontakt']]
    const accountHref = hasUser ? route('dashboard') : route('login')
    const accountLabel = hasUser ? 'Admin' : 'Prijava'

    return (
        <>
        <nav className="lp-nav" style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 40px', height: '64px',
            borderBottom: '0.5px solid var(--lp-line)',
            background: 'rgba(7,7,7,0.88)',
            backdropFilter: 'blur(12px)',
        }}>
            <a href="#" onClick={() => setMenuOpen(false)} style={{
                fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontSize: '20px',
                fontWeight: 300, color: 'var(--lp-text)', letterSpacing: '0.04em', textDecoration: 'none',
            }}>
                J. <span style={{ color: 'var(--lp-gold)' }}>Vozlič</span>
            </a>

            <div className="lp-nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                {navLinks.map(([href, label]) => (
                    <a key={href} href={href} className="lp-nav-link" style={{
                        fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase',
                        color: isActive(href) ? 'rgba(200,169,110,0.9)' : 'var(--lp-text-dim)',
                        textDecoration: 'none', transition: 'color 0.2s',
                    }}>{label}</a>
                ))}
            </div>

            <div className="lp-nav-actions" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <a href={accountHref} className="lp-nav-link" style={{
                    fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: 'var(--lp-text-dim)', textDecoration: 'none', transition: 'color 0.2s',
                }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-dim)')}>
                    {accountLabel}
                </a>
            </div>

            {/* Hamburger — shown only on narrow viewports via CSS */}
            <button
                type="button"
                className="lp-nav-toggle"
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? 'Zapri meni' : 'Odpri meni'}
                aria-expanded={menuOpen}
                style={{
                    display: 'none', flexDirection: 'column', justifyContent: 'center', gap: '5px',
                    width: '32px', height: '32px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                }}
            >
                <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--lp-text)', transition: 'transform 0.25s, opacity 0.25s', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
                <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--lp-text)', transition: 'opacity 0.2s', opacity: menuOpen ? 0 : 1 }} />
                <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--lp-text)', transition: 'transform 0.25s, opacity 0.25s', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
            </button>
        </nav>

        {/* Mobile menu overlay — rendered outside <nav> so its `position: fixed` is
            relative to the viewport, not to the nav (which has its own backdrop-filter
            and would otherwise become its containing block). */}
        {menuOpen && (
            <div className="lp-nav-mobile" style={{
                position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
                background: 'rgba(7,7,7,0.97)', backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '30px', zIndex: 99,
            }}>
                {navLinks.map(([href, label]) => (
                    <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                        fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontSize: '26px', fontWeight: 300,
                        color: isActive(href) ? 'var(--lp-gold)' : 'var(--lp-text)', textDecoration: 'none',
                    }}>{label}</a>
                ))}
                <a href={accountHref} onClick={() => setMenuOpen(false)} style={{
                    marginTop: '14px', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: 'var(--lp-text-dim)', textDecoration: 'none',
                    border: '0.5px solid var(--lp-line)', padding: '12px 28px',
                }}>{accountLabel}</a>
            </div>
        )}
        </>
    )
}

/* ── Hero ── */
function Hero({ heroPhotos, stats, heroArticle }: {
    heroPhotos: HeroPhoto[]
    stats: { galleries: number; photos: number }
    heroArticle?: HeroArticle | null
}) {
    // Randomly pick 5 photos from the pool on each page load
    const slots = useMemo(() => {
        const shuffled = [...heroPhotos]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        // 5 slots: index 0 = tall (span 2 rows, col 1), 1–4 = regular (fill remaining cells)
        return Array.from({ length: 5 }, (_, i) => shuffled[i] ?? null)
    }, [heroPhotos])

    const fallbackGradients = [
        'linear-gradient(135deg,#1a1310 0%,#2d1f14 100%)',
        'linear-gradient(135deg,#0d1520 0%,#112033 100%)',
        'linear-gradient(135deg,#121812 0%,#1e2d1a 100%)',
        'linear-gradient(135deg,#101410 0%,#1e2818 100%)',
    ]

    return (
        <section className="lp-hero" style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            paddingTop: '64px',
        }}>
            {/* Left */}
            <div className="lp-hero-left" style={{
                padding: '80px 40px 60px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                borderRight: '0.5px solid var(--lp-line)',
            }}>
                <div>
                    <div className="lp-reveal" style={{
                        fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: 'var(--lp-text-faint)', display: 'flex', alignItems: 'center', gap: '10px',
                        marginBottom: '40px',
                    }}>
                        <span style={{ width: '28px', height: '0.5px', background: 'var(--lp-gold)', display: 'block' }} />
                        {heroArticle?.tagline || `Dostopno za projekte — ${new Date().getFullYear()}`}
                    </div>

                    <h1 className="lp-reveal lp-reveal-d1" style={{
                        fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontWeight: 300,
                        fontSize: 'clamp(52px, 7vw, 86px)', lineHeight: 1.0,
                        color: 'var(--lp-text)', letterSpacing: '-0.01em',
                    }}>
                        {heroArticle?.title
                            ? heroArticle.title
                            : <>Svetloba,<br />ki <em style={{ fontStyle: 'normal', color: 'var(--lp-gold)' }}>govori</em><br />sama zase.</>
                        }
                    </h1>

                    <p className="lp-reveal lp-reveal-d2" style={{
                        fontSize: '11px', lineHeight: 1.8, color: 'var(--lp-text-dim)',
                        maxWidth: '340px', marginTop: '32px',
                        borderLeft: '0.5px solid var(--lp-gold-dim)', paddingLeft: '20px',
                    }}>
                        {heroArticle?.excerpt || 'Dokumentiram trenutke, ki ostanejo. Portretna, poročna in arhitekturna fotografija z editorial občutkom za detajl in atmosfero.'}
                    </p>
                </div>

                <div className="lp-reveal lp-reveal-d3 lp-hero-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
                    <div className="lp-hero-stats" style={{ display: 'flex', gap: '36px' }}>
                        {[
                            [stats.photos, 'Fotografij'],
                            [stats.galleries, 'Galerij'],
                            ['8+', 'Let izkušenj'],
                        ].map(([num, lbl]) => (
                            <div key={String(lbl)}>
                                <div style={{ fontFamily: 'var(--lp-serif)', fontSize: '36px', fontWeight: 300, color: 'var(--lp-text)', lineHeight: 1 }}>{num}</div>
                                <div style={{ fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lp-text-faint)', marginTop: '4px' }}>{lbl}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lp-text-faint)' }}>
                        <span>Scroll</span>
                        <div className="lp-scroll-line" />
                    </div>
                </div>
            </div>

            {/* Right: 4-slot photo grid (1 tall left + 3 stacked right) */}
            {/* Grid: 2 cols × 3 rows. Slot 0 spans rows 1-2 on col 1. Slots 1-3 fill col 2. */}
            <div className="lp-hero-right" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: '1px', background: 'var(--lp-line)' }}>
                {slots.map((slot, i) => (
                    <div key={i} className={slot ? 'lp-hero-img' : undefined} style={{
                        position: 'relative', overflow: 'hidden', cursor: slot ? 'pointer' : 'default',
                        background: slot ? 'var(--lp-bg2)' : fallbackGradients[i],
                        ...(i === 0 ? { gridRow: 'span 2' } : {}),
                    }}>
                        {slot ? (
                            <>
                                <div className="lp-hero-img-bg" style={{
                                    backgroundImage: `url(${slot.url})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    height: '100%',
                                }} />
                                <div style={{
                                    position: 'absolute', bottom: '14px', left: '14px',
                                    fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.5)',
                                    padding: '3px 8px', borderRadius: '1px',
                                }}>
                                    {slot.label}
                                </div>
                            </>
                        ) : null}
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ── Gallery section ── */
function GallerySection({ galleries, allTags }: { galleries: GalleryItem[]; allTags: string[] }) {
    const [activeTag, setActiveTag] = useState('vse')
    const [search, setSearch] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollByAmount = (dir: 1 | -1) => {
        const el = scrollRef.current
        if (!el) return
        el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
    }

    const visibleGalleries = galleries
        .filter(g => activeTag === 'vse' || g.tags.includes(activeTag))
        .filter(g => g.title.toLowerCase().includes(search.trim().toLowerCase()))

    const formatDate = (d?: string | null) => {
        if (!d) return ''
        return new Date(d).toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' })
    }

    const gradients = [
        'linear-gradient(150deg,#1c1410 0%,#2e1e10 100%)',
        'linear-gradient(160deg,#0a1220 0%,#142040 100%)',
        'linear-gradient(140deg,#111a10 0%,#1c2e18 100%)',
        'linear-gradient(155deg,#1c0a0a 0%,#2e1212 100%)',
        'linear-gradient(145deg,#0e1418 0%,#182030 100%)',
        'linear-gradient(165deg,#1a1814 0%,#2e2a1e 100%)',
    ]

    const H = 'min(62vh, 540px)'

    return (
        <>
            {/* Filter bar */}
            <section id="portfolio" style={{
                borderBottom: '0.5px solid var(--lp-line)', borderTop: '0.5px solid var(--lp-line)',
                position: 'sticky', top: '64px', zIndex: 50,
                background: 'rgba(7,7,7,0.95)', backdropFilter: 'blur(10px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {['vse', ...allTags].map(tag => {
                        const count = tag === 'vse' ? galleries.length : galleries.filter(g => g.tags.includes(tag)).length
                        const isActive = activeTag === tag
                        return (
                            <button key={tag} onClick={() => setActiveTag(tag)} className="lp-gal-filter-btn" style={{
                                flexShrink: 0, fontFamily: 'var(--lp-mono)', fontSize: '9px',
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: isActive ? 'var(--lp-gold)' : 'var(--lp-text-faint)',
                                padding: '14px 22px', border: 'none',
                                background: isActive ? 'var(--lp-gold-faint)' : 'transparent',
                                cursor: 'pointer', borderRight: '0.5px solid var(--lp-line)',
                                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'color 0.2s, background 0.2s',
                            }}>
                                {tag === 'vse' ? 'Vse' : tag}
                                <span style={{ fontSize: '8px', color: isActive ? 'var(--lp-gold-dim)' : 'var(--lp-text-faint)' }}>{count}</span>
                            </button>
                        )
                    })}
                    <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', borderLeft: '0.5px solid var(--lp-line)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lp-text-faint)', flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Iskanje galerij..."
                            className="lp-gal-search"
                            style={{
                                background: 'transparent', border: 'none', outline: 'none',
                                fontFamily: 'var(--lp-mono)', fontSize: '9px', letterSpacing: '0.12em',
                                textTransform: 'uppercase', color: 'var(--lp-text)',
                                width: '210px',
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Horizontal scroll gallery */}
            <section className="lp-gal-wrap" style={{ position: 'relative' }}>
                <button
                    type="button"
                    aria-label="Premakni levo"
                    className="lp-gal-arrow lp-gal-arrow--prev"
                    onClick={() => scrollByAmount(-1)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <button
                    type="button"
                    aria-label="Premakni desno"
                    className="lp-gal-arrow lp-gal-arrow--next"
                    onClick={() => scrollByAmount(1)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
                <div ref={scrollRef} className="lp-gal-scroll" style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '1px',
                    background: 'var(--lp-line)',
                    height: H,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none' as any,
                }}>
                    {visibleGalleries.map((g, idx) => {
                        const isFirst = idx === 0
                        const cardWidth = isFirst ? `calc(${H} * 1.35)` : `calc(${H} * 0.65)`
                        return (
                            <a
                                key={g.id}
                                href={`/galerija/${g.slug}`}
                                className="lp-gal-item"
                                style={{
                                    position: 'relative', overflow: 'hidden',
                                    flexShrink: 0, width: cardWidth, height: '100%',
                                    background: 'var(--lp-bg2)',
                                    textDecoration: 'none', display: 'block',
                                }}
                            >
                                <div className="lp-gal-bg" style={{
                                    backgroundImage: g.cover ? `url(${g.cover})` : gradients[idx % gradients.length],
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    width: '100%', height: '100%',
                                }} />
                                <div className="lp-gal-overlay" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px' }}>
                                    <div className="lp-gal-info">
                                        <div style={{ fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontSize: isFirst ? '22px' : '16px', fontWeight: 300, color: 'rgba(255,255,255,0.92)', lineHeight: 1.2 }}>{g.title}</div>
                                        <div style={{ fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                                            {[g.tags[0], formatDate(g.gallery_date)].filter(Boolean).join(' · ')}
                                        </div>
                                    </div>
                                </div>
                                <div className="lp-gal-num" style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '8px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                            </a>
                        )
                    })}
                </div>
            </section>
        </>
    )
}

/* ── About ── */
function AboutSection({ article, photographerPhotos, fallbackCover }: {
    article?: AboutArticle | null
    photographerPhotos: string[]
    fallbackCover?: string | null
}) {
    const photos = photographerPhotos.length > 0 ? photographerPhotos : (fallbackCover ? [fallbackCover] : [])

    // Random start index, then cycle automatically
    const [idx, setIdx] = useState(() =>
        photos.length > 0 ? Math.floor(Math.random() * photos.length) : 0
    )
    const [fading, setFading] = useState(false)

    useEffect(() => {
        if (photos.length <= 1) return
        const timer = setInterval(() => {
            setFading(true)
            setTimeout(() => {
                setIdx(prev => (prev + 1) % photos.length)
                setFading(false)
            }, 600)
        }, 5000)
        return () => clearInterval(timer)
    }, [photos.length])

    const currentPhoto = photos[idx] ?? null

    return (
        <section id="o-meni" className="lp-about" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            borderTop: '0.5px solid var(--lp-line)', minHeight: '500px',
        }}>
            <div className="lp-reveal lp-about-photo" style={{
                borderRight: '0.5px solid var(--lp-line)',
                position: 'relative', overflow: 'hidden', background: 'var(--lp-bg2)',
            }}>
                {/* Photo with fade transition */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: currentPhoto
                        ? `url(${currentPhoto})`
                        : 'linear-gradient(160deg,#151210 0%,#20180c 40%,#0e0c08 100%)',
                    backgroundSize: 'cover', backgroundPosition: 'center top',
                    filter: 'brightness(0.65) saturate(0.6)',
                    opacity: fading ? 0 : 1,
                    transition: 'opacity 0.6s ease',
                }} />

                {/* Dot indicators when multiple photos */}
                {photos.length > 1 && (
                    <div style={{
                        position: 'absolute', bottom: '80px', left: '32px',
                        display: 'flex', gap: '6px',
                    }}>
                        {photos.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setFading(true); setTimeout(() => { setIdx(i); setFading(false) }, 300) }}
                                style={{
                                    width: i === idx ? '20px' : '6px', height: '6px',
                                    borderRadius: '3px',
                                    background: i === idx ? 'var(--lp-gold)' : 'rgba(255,255,255,0.3)',
                                    border: 'none', cursor: 'pointer', padding: 0,
                                    transition: 'width 0.3s, background 0.3s',
                                }}
                            />
                        ))}
                    </div>
                )}

                <div style={{ position: 'absolute', bottom: '32px', left: '32px', right: '32px' }}>
                    <div style={{ width: '32px', height: '0.5px', background: 'var(--lp-gold)', marginBottom: '14px' }} />
                    <p style={{ fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontSize: '22px', fontWeight: 300, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
                        "Vsaka fotografija je<br />tiha pesem o svetlobi."
                    </p>
                </div>
            </div>

            <div className="lp-about-text" style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="lp-reveal" style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lp-gold)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '20px', height: '0.5px', background: 'var(--lp-gold)', display: 'block' }} />
                    O fotografu
                </div>
                <h2 className="lp-reveal lp-reveal-d1" style={{ fontFamily: 'var(--lp-serif)', fontSize: '42px', fontWeight: 300, lineHeight: 1.1, marginBottom: '28px', color: 'var(--lp-text)' }}>
                    {article?.title ?? 'Jaka Vozlič'}
                </h2>
                {article?.excerpt && (
                    <p className="lp-reveal lp-reveal-d2" style={{ fontSize: '11px', lineHeight: 1.9, color: 'var(--lp-text-dim)', marginBottom: '16px', maxWidth: '400px' }}>
                        {article.excerpt}
                    </p>
                )}
                {article?.content && (
                    <div className="lp-reveal lp-reveal-d3" style={{ fontSize: '11px', lineHeight: 1.9, color: 'var(--lp-text-dim)', maxWidth: '400px' }}
                        dangerouslySetInnerHTML={{ __html: article.content }} />
                )}
            </div>
        </section>
    )
}

/* ── Services ── */
function ServicesSection({ articles }: { articles: ServiceArticle[] }) {
    const defaults = [
        { title: 'Portretna sesija',    excerpt: 'Individualne, poslovne in umetniške portretne fotografije v studiu ali na lokaciji.' },
        { title: 'Poročna fotografija', excerpt: 'Celodnevna dokumentacija vašega posebnega dne. Diskretno, pristno.' },
        { title: 'Editorial & komercialno', excerpt: 'Fotografije za revije, blagovne znamke in oglaševalske kampanje.' },
    ]
    const items = articles.length > 0 ? articles : defaults

    return (
        <section id="storitve" className="lp-services" style={{ padding: '100px 40px', borderTop: '0.5px solid var(--lp-line)' }}>
            <div className="lp-services-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                <h2 className="lp-reveal" style={{ fontFamily: 'var(--lp-serif)', fontSize: '48px', fontWeight: 300, fontStyle: 'italic', color: 'var(--lp-text)', lineHeight: 1 }}>Storitve</h2>
                <p className="lp-reveal lp-reveal-d1 lp-services-sub" style={{ fontSize: '10px', color: 'var(--lp-text-faint)', maxWidth: '200px', textAlign: 'right', lineHeight: 1.8 }}>Prilagojeni paketi za vsak projekt in proračun.</p>
            </div>
            <div className="lp-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--lp-line)' }}>
                {items.map((s, i) => (
                    <div key={s.id ?? i} className={`lp-service-card lp-reveal lp-reveal-d${i + 1}`} style={{ background: 'var(--lp-bg)', padding: '36px 32px', position: 'relative', paddingBottom: '64px' }}>
                        <div style={{ fontSize: '9px', letterSpacing: '0.14em', color: 'var(--lp-text-faint)', marginBottom: '24px' }}>
                            {String(i + 1).padStart(2, '0')}
                        </div>
                        <h3 style={{ fontFamily: 'var(--lp-serif)', fontSize: '24px', fontWeight: 300, color: 'var(--lp-text)', marginBottom: '16px', lineHeight: 1.2 }}>{s.title}</h3>
                        <p style={{ fontSize: '10px', color: 'var(--lp-text-dim)', lineHeight: 1.9 }}>{s.excerpt}</p>
                        {s.portfolioSlug ? (
                            <a href={`/portfolio/${s.portfolioSlug}`} className="lp-service-portfolio-link" style={{
                                position: 'absolute', bottom: '32px', right: '32px',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase',
                                color: 'var(--lp-text-faint)', textDecoration: 'none', transition: 'color 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-gold)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-faint)')}>
                                Portfolio <span style={{ fontSize: '14px' }}>↗</span>
                            </a>
                        ) : (
                            <div className="lp-service-arrow" style={{ position: 'absolute', bottom: '32px', right: '32px', fontSize: '18px', color: 'var(--lp-text-faint)' }}>↗</div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ── Contact ── */
function ContactSection({ socialLinks, contactInfo }: { socialLinks: SocialLinks; contactInfo: ContactInfo }) {
    const { flash } = usePage<Props>().props as any
    const [sent, setSent] = useState(!!flash?.contact_success)

    const { data, setData, post, processing, errors, reset } = useForm({
        name:         '',
        email:        '',
        project_type: '',
        message:      '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('contact.store'), {
            onSuccess: () => { reset(); setSent(true) },
        })
    }

    return (
        <section id="kontakt" className="lp-contact" style={{
            borderTop: '0.5px solid var(--lp-line)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px',
        }}>
            {/* Left */}
            <div className="lp-contact-left" style={{ padding: '80px 48px', borderRight: '0.5px solid var(--lp-line)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="lp-reveal" style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lp-gold)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '20px', height: '0.5px', background: 'var(--lp-gold)', display: 'block' }} />
                    Kontakt
                </div>
                <h2 className="lp-reveal lp-reveal-d1" style={{ fontFamily: 'var(--lp-serif)', fontSize: '52px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1, color: 'var(--lp-text)', marginBottom: '24px' }}>
                    Pogovorimo<br />se.
                </h2>
                <p className="lp-reveal lp-reveal-d2" style={{ fontSize: '10px', color: 'var(--lp-text-dim)', lineHeight: 1.9, maxWidth: '320px' }}>
                    Vsak projekt se začne s pogovorom. Pišite mi o svojih idejah — skupaj bomo ustvarili nekaj trajnega.
                </p>
                <div className="lp-reveal lp-reveal-d3" style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        ...(contactInfo.email ? [[`mailto:${contactInfo.email}`, contactInfo.email]] : []),
                        ...(contactInfo.phone ? [[`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`, contactInfo.phone]] : []),
                        ...(socialLinks.instagram ? [[socialLinks.instagram, 'Instagram']] : []),
                        ...(socialLinks.facebook  ? [[socialLinks.facebook,  'Facebook']]  : []),
                    ].map(([href, label]) => (
                        <a key={href} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="lp-contact-link" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '0.5px solid var(--lp-line)', textDecoration: 'none', color: 'var(--lp-text-dim)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-gold)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-dim)')}>
                            <span>{label}</span>
                            <span className="lp-link-arrow" style={{ fontSize: '14px' }}>↗</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* Right — form */}
            <div className="lp-contact-right" style={{ padding: '80px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {sent ? (
                    <div className="lp-reveal" style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--lp-serif)', fontSize: '32px', fontWeight: 300, color: 'var(--lp-gold)', marginBottom: '16px' }}>Hvala.</div>
                        <p style={{ fontSize: '11px', color: 'var(--lp-text-dim)', lineHeight: 1.9 }}>Vaše povpraševanje je bilo uspešno oddano. Odgovoril bom v najkrajšem možnem času.</p>
                        <button onClick={() => setSent(false)} style={{ marginTop: '24px', fontFamily: 'var(--lp-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lp-text-dim)', background: 'transparent', border: '0.5px solid var(--lp-line)', padding: '10px 20px', cursor: 'pointer' }}>
                            Novo povpraševanje
                        </button>
                    </div>
                ) : (
                    <form className="lp-reveal" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { key: 'name',         label: 'Vaše ime',       type: 'text',  ph: 'Ana Kovač' },
                            { key: 'email',        label: 'E-naslov',       type: 'email', ph: 'ana@email.si' },
                            { key: 'project_type', label: 'Vrsta projekta', type: 'text',  ph: 'Portret, poroka, komercialno...' },
                        ].map(({ key, label, type, ph }) => (
                            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lp-text-faint)' }}>{label}</label>
                                <input
                                    type={type}
                                    className="lp-input"
                                    placeholder={ph}
                                    value={(data as any)[key]}
                                    onChange={e => setData(key as any, e.target.value)}
                                />
                                {(errors as any)[key] && <span style={{ fontSize: '9px', color: '#e05' }}>{(errors as any)[key]}</span>}
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lp-text-faint)' }}>Sporočilo</label>
                            <textarea className="lp-textarea" placeholder="Opišite vaš projekt..." value={data.message} onChange={e => setData('message', e.target.value)} />
                            {errors.message && <span style={{ fontSize: '9px', color: '#e05' }}>{errors.message}</span>}
                        </div>
                        <button type="submit" disabled={processing} style={{
                            alignSelf: 'flex-start', fontFamily: 'var(--lp-mono)', fontSize: '9px',
                            letterSpacing: '0.16em', textTransform: 'uppercase',
                            color: '#000', background: 'var(--lp-gold)',
                            border: 'none', padding: '12px 28px', cursor: 'pointer',
                            borderRadius: '1px', marginTop: '8px',
                            opacity: processing ? 0.7 : 1,
                            transition: 'opacity 0.2s, transform 0.15s',
                        }}>
                            {processing ? 'Pošiljam...' : 'Pošlji povpraševanje →'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    )
}

/* ── Footer ── */
function Footer({ socialLinks }: { socialLinks: SocialLinks }) {
    const links = [
        socialLinks.instagram ? { href: socialLinks.instagram, label: 'Instagram' } : null,
        socialLinks.facebook  ? { href: socialLinks.facebook,  label: 'Facebook'  } : null,
    ].filter(Boolean) as { href: string; label: string }[]

    return (
        <footer className="lp-footer" style={{
            borderTop: '0.5px solid var(--lp-line)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '24px 40px',
        }}>
            <div style={{ fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontSize: '15px', color: 'var(--lp-text-dim)' }}>
                Jaka Vozlič Photography
            </div>
            <div style={{ fontSize: '9px', letterSpacing: '0.1em', color: 'var(--lp-text-faint)' }}>
                © {new Date().getFullYear()} Jaka Vozlič. Vse pravice pridržane.
            </div>
            {links.length > 0 && (
                <div style={{ display: 'flex', gap: '24px' }}>
                    {links.map(({ href, label }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lp-text-faint)', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-gold)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-faint)')}>
                            {label}
                        </a>
                    ))}
                </div>
            )}
        </footer>
    )
}

/* ── Main page ── */
export default function Welcome({ galleries, allTags, heroPhotos, stats, socialLinks, contactInfo, photographerPhotos, heroArticle, aboutArticle, serviceArticles }: Props) {
    const { curRef, ringRef } = useCursor()
    useScrollReveal()
    const [cursorHover, setCursorHover] = useState(false)

    // Cursor hover on interactive elements
    useEffect(() => {
        const enter = () => setCursorHover(true)
        const leave = () => setCursorHover(false)
        const els = document.querySelectorAll('a, button, .lp-gal-item, .lp-hero-img')
        els.forEach(el => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave) })
        return () => els.forEach(el => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave) })
    }, [galleries])

    const { auth } = usePage<Props>().props

    // About cover: first cover from first gallery
    const aboutCover = galleries.find(g => g.cover)?.cover

    return (
        <>
            <Head title="Jaka Vozlič Photography" />
            <div className="lp">
                {/* Custom cursor */}
                <div ref={curRef} className={`lp-cursor${cursorHover ? ' lp-cursor-hover' : ''}`} />
                <div ref={ringRef} className={`lp-cursor-ring${cursorHover ? ' lp-cursor-ring-hover' : ''}`} />

                <Nav hasUser={!!auth?.user} />
                <Hero heroPhotos={heroPhotos} stats={stats} heroArticle={heroArticle} />
                <GallerySection galleries={galleries} allTags={allTags} />
                <AboutSection article={aboutArticle} photographerPhotos={photographerPhotos} fallbackCover={aboutCover as string | null} />
                <ServicesSection articles={serviceArticles} />
                <ContactSection socialLinks={socialLinks} contactInfo={contactInfo} />
                <Footer socialLinks={socialLinks} />
            </div>
        </>
    )
}
