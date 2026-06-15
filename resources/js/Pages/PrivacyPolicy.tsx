import { Head } from '@inertiajs/react'

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Politika zasebnosti — Jaka Vozlič Photography" />
            <div className="lp" style={{ cursor: 'default' }}>
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
                    <a href="/" style={{
                        fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase',
                        color: 'var(--lp-text-dim)', textDecoration: 'none',
                    }}>
                        ← Domov
                    </a>
                </nav>

                <div style={{
                    paddingTop: '64px',
                    padding: '120px 60px 80px',
                    maxWidth: '760px', margin: '0 auto',
                }}>
                    <h1 style={{
                        fontFamily: 'var(--lp-serif)', fontStyle: 'italic', fontWeight: 300,
                        fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--lp-text)',
                        lineHeight: 1.1, marginBottom: '32px',
                    }}>
                        Politika zasebnosti
                    </h1>

                    <div style={{ fontSize: '13px', lineHeight: 1.9, color: 'var(--lp-text-dim)' }}>
                        <p style={{ marginBottom: '24px' }}>
                            Upravljavec spletne strani je Jaka Vozlič. Ta stran v nadaljevanju opisuje,
                            katere podatke obdelujemo ob vašem obisku in zakaj.
                        </p>

                        <h2 style={{ color: 'var(--lp-text)', fontSize: '16px', fontWeight: 500, marginTop: '32px', marginBottom: '12px' }}>
                            Piškotki
                        </h2>
                        <p style={{ marginBottom: '16px' }}>
                            Stran uporablja piškotek <code>vid</code>, ki ob prvem obisku dobi naključno,
                            anonimno vrednost in se shrani za 365 dni. Piškotek ne vsebuje osebnih podatkov
                            in se uporablja izključno za štetje obiskov in osnovno statistiko (npr. ali se
                            obiskovalec na stran vrača).
                        </p>
                        <p style={{ marginBottom: '16px' }}>
                            Piškotek <code>cookie_notice</code> si zapomni, da ste to obvestilo že potrdili.
                        </p>

                        <h2 style={{ color: 'var(--lp-text)', fontSize: '16px', fontWeight: 500, marginTop: '32px', marginBottom: '12px' }}>
                            IP naslov in geolokacija
                        </h2>
                        <p style={{ marginBottom: '16px' }}>
                            Ob vsakem obisku se vaš IP naslov posreduje zunanji storitvi{' '}
                            <a href="https://ip-api.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lp-gold)' }}>
                                ip-api.com
                            </a>{' '}
                            za določitev države, iz katere prihajate. V naši podatkovni bazi shranimo
                            samo ime države — vaš IP naslov se ne shranjuje.
                        </p>

                        <h2 style={{ color: 'var(--lp-text)', fontSize: '16px', fontWeight: 500, marginTop: '32px', marginBottom: '12px' }}>
                            Kontaktni obrazec
                        </h2>
                        <p style={{ marginBottom: '16px' }}>
                            Če nam preko kontaktnega obrazca posredujete ime, e-poštni naslov in
                            sporočilo, te podatke hranimo zaradi odgovora na vaše povpraševanje.
                        </p>

                        <h2 style={{ color: 'var(--lp-text)', fontSize: '16px', fontWeight: 500, marginTop: '32px', marginBottom: '12px' }}>
                            Vaše pravice
                        </h2>
                        <p style={{ marginBottom: '16px' }}>
                            Glede podatkov, ki jih hranimo o vas, lahko kadarkoli zahtevate vpogled,
                            popravek ali izbris. Pišite nam na kontaktni naslov, naveden na naslovni strani.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
