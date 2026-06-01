import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { useState } from 'react';
import { Check, ChevronsUpDown, X, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import { Toggle } from '@/Components/ui/toggle';

interface User {
    id: number;
    name: string;
    email: string;
    gsm_number?: string;
}

interface Props {
    users: User[];
}

export default function EmailNotificationForm({ users }: Props) {
    const { t } = useTranslation();
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [sendToAll, setSendToAll] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const [useCustomEmail, setUseCustomEmail] = useState(false);

    const { data, setData, post, errors, processing, reset } = useForm({
        recipient_email: '',
        subject: '',
        message: '',
    });

    const handleUserSelect = (userId: number) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
        setSendToAll(false);
    };

    const handleRemoveUser = (userId: number) => {
        setSelectedUsers(prev => prev.filter(id => id !== userId));
    };

    const handleSelectAll = () => {
        setSendToAll(true);
        setSelectedUsers([]);
        setOpen(false);
    };

    const handleClearAll = () => {
        setSelectedUsers([]);
        setSendToAll(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // If sending to all users, show confirmation dialog
        if (sendToAll && !useCustomEmail) {
            setShowConfirmDialog(true);
            return;
        }

        // Otherwise send directly
        sendNotification();
    };

    const sendNotification = () => {
        const formData: any = {
            subject: data.subject,
            message: data.message,
        };

        if (useCustomEmail) {
            formData.recipient_email = data.recipient_email;
        } else {
            formData.recipient_ids = sendToAll ? null : selectedUsers;
            formData.send_to_all = sendToAll;
        }

        post(route('notifications.send-email'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedUsers([]);
                setSendToAll(false);
                setShowConfirmDialog(false);
                setUseCustomEmail(false);
            },
        });
    };

    const selectedUserObjects = users.filter(u => selectedUsers.includes(u.id));

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{t('Send Email')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!useCustomEmail ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>{t('Recipients')}</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Toggle
                                                    pressed={useCustomEmail}
                                                    onPressedChange={(pressed) => {
                                                        setUseCustomEmail(pressed);
                                                        if (pressed) {
                                                            setSelectedUsers([]);
                                                            setSendToAll(false);
                                                        }
                                                    }}
                                                    size="sm"
                                                    aria-label={t('Use custom email address')}
                                                >
                                                    <AtSign className="h-4 w-4" />
                                                </Toggle>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('Use custom email address')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between"
                                        >
                                            {sendToAll
                                                ? `${t('All Users')} (${users.length})`
                                                : selectedUsers.length > 0
                                                ? `${selectedUsers.length} ${t('selected')}`
                                                : t('Select recipients...')}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder={t('Search users...')} />
                                            <CommandList>
                                                <CommandEmpty>{t('No users found')}</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        onSelect={handleSelectAll}
                                                        className="font-semibold"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                sendToAll ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {t('All Users')} ({users.length})
                                                    </CommandItem>
                                                </CommandGroup>
                                                <CommandGroup heading={t('Individual Users')}>
                                                    {users.map((user) => (
                                                        <CommandItem
                                                            key={user.id}
                                                            onSelect={() => handleUserSelect(user.id)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedUsers.includes(user.id)
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium">{user.name}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                {/* Selected users badges */}
                                {!sendToAll && selectedUserObjects.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedUserObjects.map((user) => (
                                            <Badge key={user.id} variant="secondary" className="pl-2 pr-1">
                                                {user.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveUser(user.id)}
                                                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearAll}
                                            className="h-6 px-2"
                                        >
                                            {t('Clear all')}
                                        </Button>
                                    </div>
                                )}

                                {sendToAll && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="default" className="pl-2 pr-1">
                                            {t('All Users')} ({users.length})
                                            <button
                                                type="button"
                                                onClick={handleClearAll}
                                                className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="recipient_email">{t('Email Address')}</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Toggle
                                                    pressed={!useCustomEmail}
                                                    onPressedChange={(pressed) => {
                                                        setUseCustomEmail(!pressed);
                                                    }}
                                                    size="sm"
                                                    aria-label={t('Select from users')}
                                                >
                                                    <AtSign className="h-4 w-4" />
                                                </Toggle>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('Select from users')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="recipient_email"
                                    type="email"
                                    value={data.recipient_email}
                                    onChange={(e) => setData('recipient_email', e.target.value)}
                                    required
                                />
                                {errors.recipient_email && (
                                    <p className="text-sm text-destructive">{errors.recipient_email}</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="subject">{t('Subject')}</Label>
                            <Input
                                id="subject"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                required
                            />
                            {errors.subject && (
                                <p className="text-sm text-destructive">{errors.subject}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">{t('Message')}</Label>
                            <Textarea
                                id="message"
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                required
                                rows={5}
                            />
                            {errors.message && (
                                <p className="text-sm text-destructive">{errors.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing || (!useCustomEmail && !sendToAll && selectedUsers.length === 0)}
                            >
                                {t('Send Email')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Confirmation Dialog for Send to All */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Confirm Send to All Users')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('You are about to send this email to all')} <strong>{users.length}</strong> {t('users')}.
                            <br /><br />
                            <strong>{t('Subject')}:</strong> {data.subject}
                            <br />
                            <strong>{t('Message')}:</strong> {data.message.substring(0, 100)}
                            {data.message.length > 100 && '...'}
                            <br /><br />
                            {t('Are you sure you want to continue?')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>
                            {t('Cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={sendNotification}
                            disabled={processing}
                        >
                            {t('Yes, Send to All')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
