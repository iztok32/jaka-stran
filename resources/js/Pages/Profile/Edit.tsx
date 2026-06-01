import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateProfileAvatar from './Partials/UpdateProfileAvatar';
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

interface Permissions {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    permissions: Permissions;
}

export default function Edit({ mustVerifyEmail, status, permissions }: Props) {
    const { t } = useTranslation();

    // Determine which tabs should be visible
    const visibleTabs = useMemo(() => {
        const tabs = [];

        // Profile tab: visible if user has view permission
        if (permissions.canView) {
            tabs.push('profile');
        }

        // Password tab: always visible
        tabs.push('password');

        // Delete tab: visible if user has delete permission
        if (permissions.canDelete) {
            tabs.push('delete');
        }

        return tabs;
    }, [permissions]);

    // Default tab is first visible tab
    const defaultTab = visibleTabs[0] || 'password';

    // Calculate grid columns based on number of visible tabs
    const gridCols = visibleTabs.length === 1 ? 'grid-cols-1' :
                     visibleTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Profile')}
                </h2>
            }
        >
            <Head title={t('Profile')} />

            <div className="space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <Tabs defaultValue={defaultTab} className="w-full">
                            <TabsList className={`grid w-full ${gridCols}`}>
                                {permissions.canView && (
                                    <TabsTrigger value="profile" className="gap-2">
                                        <User className="h-4 w-4" />
                                        {t('Profile Information')}
                                    </TabsTrigger>
                                )}
                                <TabsTrigger value="password" className="gap-2">
                                    <Lock className="h-4 w-4" />
                                    {t('Update Password')}
                                </TabsTrigger>
                                {permissions.canDelete && (
                                    <TabsTrigger value="delete" className="gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        {t('Delete Account')}
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {permissions.canView && (
                                <TabsContent value="profile" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Avatar Section - 1/3 width */}
                                        <div className="lg:col-span-1">
                                            <Card>
                                                <CardContent className="p-6">
                                                    <UpdateProfileAvatar canEdit={permissions.canEdit} />
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Profile Information - 2/3 width */}
                                        <div className="lg:col-span-2">
                                            <Card>
                                                <CardContent className="p-6">
                                                    <UpdateProfileInformationForm
                                                        mustVerifyEmail={mustVerifyEmail}
                                                        status={status}
                                                        canEdit={permissions.canEdit}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>
                            )}

                            <TabsContent value="password" className="mt-6">
                                <UpdatePasswordForm />
                            </TabsContent>

                            {permissions.canDelete && (
                                <TabsContent value="delete" className="mt-6">
                                    <DeleteUserForm />
                                </TabsContent>
                            )}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
