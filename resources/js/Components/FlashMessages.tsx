import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

export default function FlashMessages() {
    const { flash } = usePage().props as any;

    if (!flash) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'error':
                return <XCircle className="h-4 w-4" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getVariant = (type: string): 'default' | 'destructive' => {
        return type === 'error' ? 'destructive' : 'default';
    };

    return (
        <div className="space-y-2">
            {flash.success && (
                <Alert variant="default" className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-900 dark:text-green-100">
                            {flash.success}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            {flash.error && (
                <Alert variant="destructive">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                            {flash.error}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            {flash.warning && (
                <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                            {flash.warning}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            {flash.info && (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-900 dark:text-blue-100">
                            {flash.info}
                        </AlertDescription>
                    </div>
                </Alert>
            )}
        </div>
    );
}
