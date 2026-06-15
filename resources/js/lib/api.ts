export function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
}

/**
 * fetch() wrapper for same-origin admin API calls. Adds the CSRF token header
 * and, if the session/token has expired (419 Page Expired), alerts the user
 * and reloads the page so the next attempt gets a fresh token.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const res = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            ...(options.headers ?? {}),
        },
    })

    if (res.status === 419) {
        alert('Seja je potekla. Stran bo ponovno naložena, poskusi ponovno.')
        window.location.reload()
        throw new Error('Session expired (419)')
    }

    return res
}
