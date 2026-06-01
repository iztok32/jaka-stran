import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10 relative">
            <div className="absolute right-4 top-4 md:right-8 md:top-8 flex items-center space-x-4">
                <LanguageSwitcher />
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm md:max-w-4xl">
                {children}
            </div>
        </div>
    );
}
