import { useTranslation } from '@/lib/i18n';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/Components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/Components/ui/badge';

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
    notifications: Notification[];
    type: string;
}

export default function NotificationHistory({ notifications, type }: Props) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="default" className="bg-green-600">{t('Sent')}</Badge>;
            case 'failed':
                return <Badge variant="destructive">{t('Failed')}</Badge>;
            case 'pending':
                return <Badge variant="secondary">{t('Pending')}</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="cursor-pointer">
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full">
                            <CardTitle className="flex items-center gap-2">
                                {t('Sent Notifications')} ({notifications.length})
                            </CardTitle>
                            <Button variant="ghost" size="sm">
                                {isOpen ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        {notifications.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {t('No notifications sent yet')}
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="border rounded-lg p-4 space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                {notification.subject && (
                                                    <h4 className="font-semibold">
                                                        {notification.subject}
                                                    </h4>
                                                )}
                                                <div className="text-sm text-muted-foreground">
                                                    <span className="font-medium">
                                                        {t('From')}:
                                                    </span>{' '}
                                                    {notification.sender}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    <span className="font-medium">
                                                        {t('To')}:
                                                    </span>{' '}
                                                    {notification.recipient}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                {getStatusBadge(notification.status)}
                                            </div>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {notification.message}
                                        </p>
                                        <div className="text-xs text-muted-foreground pt-2 border-t">
                                            {notification.sent_at
                                                ? formatDate(notification.sent_at)
                                                : formatDate(notification.created_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
