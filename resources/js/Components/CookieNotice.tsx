import { useEffect, useState } from 'react'

const COOKIE_NAME = 'cookie_notice'

export default function CookieNotice() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const hasConsentCookie = document.cookie
            .split('; ')
            .some(c => c.startsWith(`${COOKIE_NAME}=`))
        if (!hasConsentCookie) setVisible(true)
    }, [])

    const dismiss = () => {
        document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 300,
            background: 'rgba(7,7,7,0.96)', borderTop: '0.5px solid var(--lp-line, #2a2a2a)',
            backdropFilter: 'blur(12px)',
            padding: '16px 24px',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
            gap: '16px',
        }}>
            <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: 0, maxWidth: '640px' }}>
                Ta spletna stran za osnovno statistiko obiska uporablja anonimen piškotek in
                ob obisku obdela vaš IP naslov za določitev države, iz katere prihajate.
                Več o tem v {' '}
                <a href="/politika-zasebnosti" style={{ color: 'var(--lp-gold, #c9a875)', textDecoration: 'underline' }}>
                    politiki zasebnosti
                </a>.
            </p>
            <button onClick={dismiss} style={{
                fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#0a0a0a', background: 'var(--lp-gold, #c9a875)',
                border: 'none', borderRadius: '2px', padding: '10px 22px',
                cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
                Razumem
            </button>
        </div>
    )
}
