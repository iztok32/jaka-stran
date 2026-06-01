import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import RolePermissionsPanel from './Partials/RolePermissionsPanel';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Permission {
    id: number;
    name: string;
    slug: string;
    module: string;
    is_active: boolean;
    is_assigned: boolean;
}

interface ModulePermissions {
    module: string;
    web_root: string | null;
    description: string | null;
    standard: Permission[];
    custom: Permission[];
    assigned_count: number;
    total_count: number;
}

interface NavigationPreview {
    configs: Record<string, string>;
    blocks: {
        type: string;
        group: string;
        label: string;
        items: any[];
    }[];
}

interface Props {
    roles: Role[];
    selectedRole: Role | null;
    sidebarPermissions: ModulePermissions[];
    nonSidebarPermissions: ModulePermissions[];
    navigationPreview: NavigationPreview | null;
    standardPermissions: string[];
    canEditRole: boolean;
    isSuperAdmin: boolean;
}

export default function Index({ roles, selectedRole, sidebarPermissions, nonSidebarPermissions, navigationPreview, standardPermissions, canEditRole, isSuperAdmin }: Props) {
    const { t } = useTranslation();

    const handleRoleSelect = (roleId: number) => {
        router.get(route('roles-permissions.index', { role_id: roleId }), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Roles & Permissions')}
                </h2>
            }
        >
            <Head title={t('Roles & Permissions')} />

            <RolePermissionsPanel
                roles={roles}
                selectedRole={selectedRole}
                sidebarPermissions={sidebarPermissions}
                nonSidebarPermissions={nonSidebarPermissions}
                navigationPreview={navigationPreview}
                standardPermissions={standardPermissions}
                onRoleSelect={handleRoleSelect}
                canEditRole={canEditRole}
                isSuperAdmin={isSuperAdmin}
            />
        </AuthenticatedLayout>
    );
}
