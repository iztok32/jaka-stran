import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import ThemeToggle from "@/Components/ThemeToggle";
import { Shield, Users, Zap, Lock, Bell, Layout } from 'lucide-react';

export default function Welcome({ auth }: PageProps) {
    const { t } = useTranslation();

    const features = [
        {
            icon: Shield,
            title: t('Advanced Security'),
            description: t('Comprehensive role-based access control with granular permissions management')
        },
        {
            icon: Users,
            title: t('User Management'),
            description: t('Complete user administration with role assignments and activity tracking')
        },
        {
            icon: Layout,
            title: t('Customizable Navigation'),
            description: t('Dynamic menu system that adapts to user permissions and roles')
        },
        {
            icon: Bell,
            title: t('Notifications'),
            description: t('Multi-channel notification system supporting portal, email, and SMS delivery')
        },
        {
            icon: Lock,
            title: t('Audit Logging'),
            description: t('Complete activity tracking with detailed audit trails for compliance')
        },
        {
            icon: Zap,
            title: t('Modern Stack'),
            description: t('Built with Laravel, React, and TypeScript for robust performance')
        }
    ];

    return (
        <>
            <Head title={t('Welcome')} />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                {/* Header */}
                <header className="border-b border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                                        <Layout className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {t('Application')}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <LanguageSwitcher />
                                    <ThemeToggle />
                                </div>
                            </div>
                            <nav className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                                    >
                                        {t('Dashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                            {t('Log in')}
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                                        >
                                            {t('Register')}
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative py-20 sm:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                <span className="block">{t('Welcome to')}</span>
                                <span className="block text-primary mt-2">{t('Modern Web Application')}</span>
                            </h1>
                            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400">
                                {t('A powerful platform built with cutting-edge technologies to deliver exceptional user experience and robust functionality')}
                            </p>
                            <div className="mt-10 flex justify-center gap-4">
                                {!auth.user && (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="px-8 py-3 rounded-lg text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                                        >
                                            {t('Get Started')}
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="px-8 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors border border-gray-300 dark:border-zinc-700"
                                        >
                                            {t('Sign In')}
                                        </Link>
                                    </>
                                )}
                                {auth.user && (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-8 py-3 rounded-lg text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        {t('Go to Dashboard')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white dark:bg-zinc-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                {t('Key Features')}
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                {t('Everything you need to manage your application efficiently')}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="p-6 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-primary dark:hover:border-primary transition-colors"
                                    >
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            {t('Ready to get started?')}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                            {t('Join us today and experience the power of modern web application')}
                        </p>
                        {!auth.user && (
                            <Link
                                href={route('register')}
                                className="inline-block px-8 py-3 rounded-lg text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                            >
                                {t('Create Account')}
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            © {new Date().getFullYear()} {t('All rights reserved')}
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
