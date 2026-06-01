import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import PortalNotificationForm from './Partials/PortalNotificationForm';
import EmailNotificationForm from './Partials/EmailNotificationForm';
import SmsNotificationForm from './Partials/SmsNotificationForm';
import NotificationHistory from './Partials/NotificationHistory';

interface User {
    id: number;
    name: string;
    email: string;
    gsm_number?: string;
}

interface Notification {
    id: number;
    sender: string;
    recipient: string;
    type: string;
    subject?: string;
    message: string;
    status: string;
    sent_at?: string;
    created_at: string;
}

interface Props {
    users: User[];
    notifications: Notification[];
    enabledChannels: string[];
}

export default function Index({ users, notifications, enabledChannels }: Props) {
    const { t } = useTranslation();

    // Ensure arrays are always defined
    const safeNotifications = notifications || [];
    const safeUsers = users || [];
    const safeChannels = enabledChannels && enabledChannels.length > 0
        ? enabledChannels
        : ['portal', 'email', 'sms'];

    const portalNotifications = safeNotifications.filter(n => n.type === 'portal');
    const emailNotifications = safeNotifications.filter(n => n.type === 'email');
    const smsNotifications = safeNotifications.filter(n => n.type === 'sms');

    const defaultTab = safeChannels[0] || 'portal';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Notifications')}
                </h2>
            }
        >
            <Head title={t('Notifications')} />

            <div className="space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <Tabs defaultValue={defaultTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                {safeChannels.includes('portal') && (
                                    <TabsTrigger value="portal" className="gap-2">
                                        <Bell className="h-4 w-4" />
                                        {t('Portal Notifications')}
                                    </TabsTrigger>
                                )}
                                {safeChannels.includes('email') && (
                                    <TabsTrigger value="email" className="gap-2">
                                        <Mail className="h-4 w-4" />
                                        {t('Email')}
                                    </TabsTrigger>
                                )}
                                {safeChannels.includes('sms') && (
                                    <TabsTrigger value="sms" className="gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        {t('SMS')}
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {safeChannels.includes('portal') && (
                                <TabsContent value="portal" className="space-y-6 mt-6">
                                    <PortalNotificationForm users={safeUsers} />
                                    <NotificationHistory
                                        notifications={portalNotifications}
                                        type="portal"
                                    />
                                </TabsContent>
                            )}

                            {safeChannels.includes('email') && (
                                <TabsContent value="email" className="space-y-6 mt-6">
                                    <EmailNotificationForm users={safeUsers} />
                                    <NotificationHistory
                                        notifications={emailNotifications}
                                        type="email"
                                    />
                                </TabsContent>
                            )}

                            {safeChannels.includes('sms') && (
                                <TabsContent value="sms" className="space-y-6 mt-6">
                                    <SmsNotificationForm users={safeUsers} />
                                    <NotificationHistory
                                        notifications={smsNotifications}
                                        type="sms"
                                    />
                                </TabsContent>
                            )}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
