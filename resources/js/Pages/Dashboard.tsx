import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';

export default function Dashboard() {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Dashboard')}
                </h2>
            }
        >
            <Head title={t('Dashboard')} />

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="aspect-video rounded-xl bg-muted/50" />
                    <div className="aspect-video rounded-xl bg-muted/50" />
                    <div className="aspect-video rounded-xl bg-muted/50" />
                </div>
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
                    <div className="text-gray-900 dark:text-gray-100">
                        {t("You're logged in!")}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
