import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ChevronsDownUp, ChevronsUpDown, ChevronsUpDown as SearchIcon } from 'lucide-react';
import PermissionModuleCard from './PermissionModuleCard';
import SidebarPreview from './SidebarPreview';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/Components/ui/input';

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
    onRoleSelect: (roleId: number) => void;
    canEditRole: boolean;
    isSuperAdmin: boolean;
}

export default function RolePermissionsPanel({
    roles,
    selectedRole,
    sidebarPermissions,
    nonSidebarPermissions,
    navigationPreview,
    standardPermissions,
    onRoleSelect,
    canEditRole,
    isSuperAdmin,
}: Props) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [openAccordionsSidebar, setOpenAccordionsSidebar] = useState<string[]>([]);
    const [openAccordionsNonSidebar, setOpenAccordionsNonSidebar] = useState<string[]>([]);
    const [selectedModuleWebRoot, setSelectedModuleWebRoot] = useState<string>('');
    const moduleRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!selectedModuleWebRoot) return;
        const module = sidebarPermissions.find(m => m.web_root?.replace(/^\//, '') === selectedModuleWebRoot);
        if (!module) return;
        const el = moduleRefs.current[module.module];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedModuleWebRoot]);

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExpandAll = (tab: 'sidebar' | 'non-sidebar') => {
        if (tab === 'sidebar') {
            setOpenAccordionsSidebar(sidebarPermissions.map(g => g.module));
        } else {
            setOpenAccordionsNonSidebar(nonSidebarPermissions.map(g => g.module));
        }
    };

    const handleCollapseAll = (tab: 'sidebar' | 'non-sidebar') => {
        if (tab === 'sidebar') {
            setOpenAccordionsSidebar([]);
        } else {
            setOpenAccordionsNonSidebar([]);
        }
    };

    const handleAccordionChange = (module: string, isOpen: boolean, tab: 'sidebar' | 'non-sidebar') => {
        if (tab === 'sidebar') {
            setOpenAccordionsSidebar(prev =>
                isOpen ? [...prev, module] : prev.filter(m => m !== module)
            );
        } else {
            setOpenAccordionsNonSidebar(prev =>
                isOpen ? [...prev, module] : prev.filter(m => m !== module)
            );
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 max-w-md">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            {t('Select Role')}
                        </label>
                        <Select
                            value={selectedRole?.id.toString() || ""}
                            onValueChange={(value) => onRoleSelect(parseInt(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('Select a role...')} />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder={t('Search roles...')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-9"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {filteredRoles.length > 0 ? (
                                    filteredRoles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        {t('No roles found')}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {selectedRole && (
                    <div>
                        {!canEditRole ? (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    ⚠️ {t('You cannot edit your own role permissions')}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('Manage permissions for this role')}
                            </p>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {selectedRole ? (
                    <Tabs defaultValue="sidebar" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="sidebar">
                                {t('Sidebar Modules')} ({sidebarPermissions.length})
                            </TabsTrigger>
                            <TabsTrigger value="non-sidebar">
                                {t('Other Modules')} ({nonSidebarPermissions.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="sidebar" className="mt-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Sidebar Preview - Left Side */}
                                <div className="lg:col-span-1">
                                    <SidebarPreview
                                        navigationPreview={navigationPreview}
                                        roleSlug={selectedRole?.slug || null}
                                        selectedModuleWebRoot={selectedModuleWebRoot}
                                        canEditRole={canEditRole}
                                        onModuleClick={(webRoot) => {
                                            setSelectedModuleWebRoot(webRoot);
                                            // Auto-open accordion for this module
                                            const module = sidebarPermissions.find(m => m.web_root?.replace(/^\//, '') === webRoot);
                                            if (module && !openAccordionsSidebar.includes(module.module)) {
                                                setOpenAccordionsSidebar(prev => [...prev, module.module]);
                                            }
                                        }}
                                    />
                                </div>

                                {/* Permissions List - Right Side */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            onClick={() => handleExpandAll('sidebar')}
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 p-0"
                                            title={t('Expand All')}
                                        >
                                            <ChevronsDownUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleCollapseAll('sidebar')}
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 p-0"
                                            title={t('Collapse All')}
                                        >
                                            <ChevronsUpDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {sidebarPermissions.length > 0 ? (
                                        sidebarPermissions.map((moduleData) => (
                                            <div
                                                key={moduleData.module}
                                                ref={el => { moduleRefs.current[moduleData.module] = el; }}
                                                className={selectedModuleWebRoot && moduleData.web_root?.replace(/^\//, '') === selectedModuleWebRoot ? 'ring-2 ring-primary rounded-lg' : ''}
                                            >
                                                <PermissionModuleCard
                                                    roleId={selectedRole.id}
                                                    moduleData={moduleData}
                                                    standardPermissions={standardPermissions}
                                                    isOpen={openAccordionsSidebar.includes(moduleData.module)}
                                                    onOpenChange={(isOpen) => handleAccordionChange(moduleData.module, isOpen, 'sidebar')}
                                                    canEditRole={canEditRole}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            {t('No modules found in sidebar.')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="non-sidebar" className="space-y-4 mt-4">
                            <div className="flex items-center justify-end gap-2 mb-4">
                                <Button
                                    onClick={() => handleExpandAll('non-sidebar')}
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0"
                                    title={t('Expand All')}
                                >
                                    <ChevronsDownUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => handleCollapseAll('non-sidebar')}
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0"
                                    title={t('Collapse All')}
                                >
                                    <ChevronsUpDown className="h-4 w-4" />
                                </Button>
                            </div>
                            {nonSidebarPermissions.length > 0 ? (
                                nonSidebarPermissions.map((moduleData) => (
                                    <PermissionModuleCard
                                        key={moduleData.module}
                                        roleId={selectedRole.id}
                                        moduleData={moduleData}
                                        standardPermissions={standardPermissions}
                                        isOpen={openAccordionsNonSidebar.includes(moduleData.module)}
                                        onOpenChange={(isOpen) => handleAccordionChange(moduleData.module, isOpen, 'non-sidebar')}
                                        canEditRole={canEditRole}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('No other modules found.')}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        {t('Select a role to manage permissions')}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
