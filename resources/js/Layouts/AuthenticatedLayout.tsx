import { AppSidebar } from '@/Components/app-sidebar';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemeToggle from '@/Components/ThemeToggle';
import FlashMessages from '@/Components/FlashMessages';
import { useTranslation } from '@/lib/i18n';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import { Separator } from '@/Components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/Components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Home } from 'lucide-react';
import { PropsWithChildren, ReactNode } from 'react';
import { PageProps } from '@/types';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { user } = usePage<PageProps>().props.auth;
    const { navigation } = usePage<PageProps>().props;
    const { t } = useTranslation();

    return (
        <SidebarProvider>
            <AppSidebar user={user} navigation={navigation} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b dark:border-gray-800">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    {header ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={route('dashboard')} title={t('Home')}>
                                                <Home className="size-4" />
                                            </Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>
                                            <Home className="size-4" />
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {header && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{header}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-4 px-4">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4">
                    <FlashMessages />
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
