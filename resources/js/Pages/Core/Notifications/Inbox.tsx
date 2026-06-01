import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Bell, CheckCheck, Eye } from 'lucide-react';

interface InboxNotification {
    id: number;
    sender: string;
    subject: string | null;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: InboxNotification[];
}

export default function Inbox({ notifications }: Props) {
    const { t } = useTranslation();

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const handleMarkRead = (id: number) => {
        router.post(route('notifications.mark-read', id), {}, {
            preserveScroll: true,
        });
    };

    const handleMarkAllRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString();
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('My Notifications')}
                </h2>
            }
        >
            <Head title={t('My Notifications')} />

            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <CardTitle>{t('Inbox')}</CardTitle>
                            {unreadCount > 0 && (
                                <Badge variant="destructive">{unreadCount} {t('unread')}</Badge>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleMarkAllRead}
                            >
                                <CheckCheck className="h-4 w-4" />
                                {t('Mark all as read')}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                                <Bell className="h-10 w-10 opacity-30" />
                                <p>{t('No notifications yet')}</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start gap-4 py-4 transition-colors ${
                                            !notification.read_at ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {!notification.read_at ? (
                                                <span className="flex h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                                            ) : (
                                                <span className="flex h-2.5 w-2.5 rounded-full bg-transparent mt-1.5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    {notification.subject && (
                                                        <p className={`text-sm font-medium truncate ${!notification.read_at ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {notification.subject}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {!notification.read_at && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="shrink-0 h-8 w-8"
                                                        onClick={() => handleMarkRead(notification.id)}
                                                        title={t('Mark as read')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-xs text-muted-foreground">{notification.sender}</span>
                                                <span className="text-xs text-muted-foreground">·</span>
                                                <span className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
