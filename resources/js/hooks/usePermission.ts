import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function usePermission() {
    const { auth } = usePage<PageProps>().props;
    const permissions = auth.user?.permissions || [];

    const can = (permission: string) => {
        return permissions.includes(permission);
    };

    const is = (role: string) => {
        // Opomba: Če bi želeli preverjati tudi vloge na frontendu,
        // bi jih morali prav tako deliti v HandleInertiaRequests.
        // Zaenkrat se osredotočamo na pravice.
        return false; 
    };

    return { can, is, permissions };
}
