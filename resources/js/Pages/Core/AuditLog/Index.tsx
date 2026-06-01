import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Eye, Filter, X } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';

interface AuditLog {
    id: number;
    event: string;
    auditable_type: string;
    auditable_id: number;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    old_values: Record<string, any>;
    new_values: Record<string, any>;
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

interface PaginatedAudits {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ModelType {
    value: string;
    label: string;
}

interface Props {
    audits: PaginatedAudits;
    filters: {
        model_type?: string;
        event?: string;
        user_id?: number;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
    modelTypes: ModelType[];
    eventTypes: string[];
}

export default function Index({ audits, filters, modelTypes, eventTypes }: Props) {
    const { t } = useTranslation();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null);
    const [localFilters, setLocalFilters] = useState(filters);

    const getEventBadgeVariant = (event: string) => {
        switch (event) {
            case 'created':
                return 'default';
            case 'updated':
                return 'secondary';
            case 'deleted':
                return 'destructive';
            case 'restored':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        router.get(route('audit-log.index'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
        setIsFilterOpen(false);
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('audit-log.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
        setIsFilterOpen(false);
    };

    const viewDetails = (audit: AuditLog) => {
        setSelectedAudit(audit);
    };

    const formatChanges = (oldValues: Record<string, any>, newValues: Record<string, any>) => {
        const changes: Array<{ field: string; old: any; new: any }> = [];

        Object.keys(newValues).forEach(key => {
            if (oldValues[key] !== newValues[key]) {
                changes.push({
                    field: key,
                    old: oldValues[key] ?? t('N/A'),
                    new: newValues[key] ?? t('N/A'),
                });
            }
        });

        return changes;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {t('Audit Log')}
                    </h2>
                    <Button onClick={() => setIsFilterOpen(true)} variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        {t('Filters')}
                    </Button>
                </div>
            }
        >
            <Head title={t('Audit Log')} />

            <div className="space-y-4">
                {Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {filters.model_type && (
                                        <Badge variant="secondary">
                                            {t('Model')}: {modelTypes.find(m => m.value === filters.model_type)?.label}
                                        </Badge>
                                    )}
                                    {filters.event && (
                                        <Badge variant="secondary">
                                            {t('Event')}: {t(filters.event)}
                                        </Badge>
                                    )}
                                    {filters.search && (
                                        <Badge variant="secondary">
                                            {t('Search')}: {filters.search}
                                        </Badge>
                                    )}
                                    {filters.date_from && (
                                        <Badge variant="secondary">
                                            {t('From')}: {filters.date_from}
                                        </Badge>
                                    )}
                                    {filters.date_to && (
                                        <Badge variant="secondary">
                                            {t('To')}: {filters.date_to}
                                        </Badge>
                                    )}
                                </div>
                                <Button onClick={clearFilters} variant="ghost" size="sm">
                                    <X className="mr-2 h-4 w-4" />
                                    {t('Clear')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Activity History')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Date/Time')}</TableHead>
                                    <TableHead>{t('User')}</TableHead>
                                    <TableHead>{t('Event')}</TableHead>
                                    <TableHead>{t('Model')}</TableHead>
                                    <TableHead>{t('Record ID')}</TableHead>
                                    <TableHead>{t('IP Address')}</TableHead>
                                    <TableHead className="text-right">{t('Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {audits.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            {t('No audit logs found')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    audits.data.map((audit) => (
                                        <TableRow key={audit.id}>
                                            <TableCell className="font-medium">
                                                {new Date(audit.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {audit.user ? (
                                                    <div>
                                                        <div className="font-medium">{audit.user.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {audit.user.email}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">{t('System')}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getEventBadgeVariant(audit.event)}>
                                                    {t(audit.event)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{audit.auditable_type}</TableCell>
                                            <TableCell>{audit.auditable_id}</TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">
                                                    {audit.ip_address || t('N/A')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    onClick={() => viewDetails(audit)}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {audits.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    {t('Showing')} {audits.data.length} {t('of')} {audits.total} {t('records')}
                                </div>
                                <div className="flex gap-2">
                                    {audits.current_page > 1 && (
                                        <Button
                                            onClick={() => router.get(route('audit-log.index', { ...filters, page: audits.current_page - 1 }))}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {t('Previous')}
                                        </Button>
                                    )}
                                    {audits.current_page < audits.last_page && (
                                        <Button
                                            onClick={() => router.get(route('audit-log.index', { ...filters, page: audits.current_page + 1 }))}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {t('Next')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filter Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{t('Filter Audit Logs')}</SheetTitle>
                        <SheetDescription>
                            {t('Apply filters to narrow down the audit log results')}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 mt-6">
                        <div className="space-y-2">
                            <Label htmlFor="model_type">{t('Model Type')}</Label>
                            <Select
                                value={localFilters.model_type || ''}
                                onValueChange={(value) => handleFilterChange('model_type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('All models')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t('All models')}</SelectItem>
                                    {modelTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event">{t('Event Type')}</Label>
                            <Select
                                value={localFilters.event || ''}
                                onValueChange={(value) => handleFilterChange('event', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('All events')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t('All events')}</SelectItem>
                                    {eventTypes.map((event) => (
                                        <SelectItem key={event} value={event}>
                                            {t(event)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_from">{t('Date From')}</Label>
                            <Input
                                id="date_from"
                                type="date"
                                value={localFilters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_to">{t('Date To')}</Label>
                            <Input
                                id="date_to"
                                type="date"
                                value={localFilters.date_to || ''}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="search">{t('Search in Changes')}</Label>
                            <Input
                                id="search"
                                type="text"
                                placeholder={t('Search...')}
                                value={localFilters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button onClick={applyFilters} className="flex-1">
                                {t('Apply Filters')}
                            </Button>
                            <Button onClick={clearFilters} variant="outline" className="flex-1">
                                {t('Clear')}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Details Sheet */}
            <Sheet open={!!selectedAudit} onOpenChange={() => setSelectedAudit(null)}>
                <SheetContent className="sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>{t('Audit Log Details')}</SheetTitle>
                        <SheetDescription>
                            {t('Detailed information about this audit log entry')}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedAudit && (
                        <div className="space-y-6 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">{t('Date/Time')}</Label>
                                    <p className="mt-1">{new Date(selectedAudit.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">{t('Event')}</Label>
                                    <p className="mt-1">
                                        <Badge variant={getEventBadgeVariant(selectedAudit.event)}>
                                            {t(selectedAudit.event)}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">{t('Model')}</Label>
                                    <p className="mt-1">{selectedAudit.auditable_type}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">{t('Record ID')}</Label>
                                    <p className="mt-1">{selectedAudit.auditable_id}</p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-muted-foreground">{t('User')}</Label>
                                    <p className="mt-1">
                                        {selectedAudit.user ? (
                                            <>
                                                <strong>{selectedAudit.user.name}</strong>
                                                <br />
                                                <span className="text-sm text-muted-foreground">
                                                    {selectedAudit.user.email}
                                                </span>
                                            </>
                                        ) : (
                                            t('System')
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">{t('IP Address')}</Label>
                                    <p className="mt-1">{selectedAudit.ip_address || t('N/A')}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">{t('URL')}</Label>
                                    <p className="mt-1 text-xs break-all">{selectedAudit.url || t('N/A')}</p>
                                </div>
                            </div>

                            {selectedAudit.event !== 'created' && selectedAudit.event !== 'deleted' && (
                                <div>
                                    <Label className="text-muted-foreground mb-3 block">{t('Changes')}</Label>
                                    <div className="space-y-3">
                                        {formatChanges(selectedAudit.old_values, selectedAudit.new_values).map((change, index) => (
                                            <div key={index} className="border rounded-md p-3">
                                                <div className="font-medium text-sm mb-2">{change.field}</div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <div className="text-xs text-muted-foreground mb-1">{t('Old Value')}</div>
                                                        <div className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                                                            {typeof change.old === 'object'
                                                                ? JSON.stringify(change.old, null, 2)
                                                                : String(change.old)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground mb-1">{t('New Value')}</div>
                                                        <div className="p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                                                            {typeof change.new === 'object'
                                                                ? JSON.stringify(change.new, null, 2)
                                                                : String(change.new)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedAudit.event === 'created' && Object.keys(selectedAudit.new_values).length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground mb-3 block">{t('Created Values')}</Label>
                                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                                        <pre className="text-xs overflow-auto">
                                            {JSON.stringify(selectedAudit.new_values, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {selectedAudit.event === 'deleted' && Object.keys(selectedAudit.old_values).length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground mb-3 block">{t('Deleted Values')}</Label>
                                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                                        <pre className="text-xs overflow-auto">
                                            {JSON.stringify(selectedAudit.old_values, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
