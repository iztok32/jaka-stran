import { useEffect, useState } from 'react';
import { Switch } from '@/Components/ui/switch';
import { useTranslation } from '@/lib/i18n';
import { Sun, Moon, Check } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuLabel,
} from '@/Components/ui/context-menu';
import { PageProps } from '@/types';
import axios from 'axios';

// Barvne teme iz shadcn/ui - oklch format
const COLOR_THEMES = [
    {
        name: 'Zinc',
        value: 'zinc',
        light: { primary: 'oklch(0.205 0 0)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.922 0 0)', primaryForeground: 'oklch(0.205 0 0)' },
        preview: { light: '#71717a', dark: '#52525b' }
    },
    {
        name: 'Amber',
        value: 'amber',
        light: { primary: 'oklch(0.706 0.191 84.436)', primaryForeground: 'oklch(0.145 0 0)' },
        dark: { primary: 'oklch(0.809 0.199 84.879)', primaryForeground: 'oklch(0.145 0 0)' },
        preview: { light: '#f59e0b', dark: '#d97706' }
    },
    {
        name: 'Blue',
        value: 'blue',
        light: { primary: 'oklch(0.575 0.219 264.052)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.623 0.214 259.815)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#3b82f6', dark: '#2563eb' }
    },
    {
        name: 'Cyan',
        value: 'cyan',
        light: { primary: 'oklch(0.725 0.139 220.163)', primaryForeground: 'oklch(0.145 0 0)' },
        dark: { primary: 'oklch(0.785 0.149 221.424)', primaryForeground: 'oklch(0.145 0 0)' },
        preview: { light: '#06b6d4', dark: '#0891b2' }
    },
    {
        name: 'Emerald',
        value: 'emerald',
        light: { primary: 'oklch(0.698 0.172 162.379)', primaryForeground: 'oklch(0.145 0 0)' },
        dark: { primary: 'oklch(0.756 0.183 163.272)', primaryForeground: 'oklch(0.145 0 0)' },
        preview: { light: '#10b981', dark: '#059669' }
    },
    {
        name: 'Fuchsia',
        value: 'fuchsia',
        light: { primary: 'oklch(0.652 0.281 328.364)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.701 0.292 326.743)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#d946ef', dark: '#c026d3' }
    },
    {
        name: 'Green',
        value: 'green',
        light: { primary: 'oklch(0.726 0.188 146.449)', primaryForeground: 'oklch(0.145 0 0)' },
        dark: { primary: 'oklch(0.785 0.195 147.192)', primaryForeground: 'oklch(0.145 0 0)' },
        preview: { light: '#22c55e', dark: '#16a34a' }
    },
    {
        name: 'Indigo',
        value: 'indigo',
        light: { primary: 'oklch(0.566 0.223 275.752)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.615 0.228 274.077)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#6366f1', dark: '#4f46e5' }
    },
    {
        name: 'Lime',
        value: 'lime',
        light: { primary: 'oklch(0.793 0.197 128.682)', primaryForeground: 'oklch(0.145 0 0)' },
        dark: { primary: 'oklch(0.843 0.2 127.523)', primaryForeground: 'oklch(0.145 0 0)' },
        preview: { light: '#84cc16', dark: '#65a30d' }
    },
    {
        name: 'Orange',
        value: 'orange',
        light: { primary: 'oklch(0.705 0.213 54.103)', primaryForeground: 'oklch(0.145 0 0)' },
        dark: { primary: 'oklch(0.764 0.226 53.266)', primaryForeground: 'oklch(0.145 0 0)' },
        preview: { light: '#f97316', dark: '#ea580c' }
    },
    {
        name: 'Pink',
        value: 'pink',
        light: { primary: 'oklch(0.665 0.241 353.503)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.714 0.255 353.126)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#ec4899', dark: '#db2777' }
    },
    {
        name: 'Purple',
        value: 'purple',
        light: { primary: 'oklch(0.617 0.236 301.313)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.667 0.247 300.326)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#a855f7', dark: '#9333ea' }
    },
    {
        name: 'Red',
        value: 'red',
        light: { primary: 'oklch(0.627 0.258 29.234)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.676 0.264 27.913)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#ef4444', dark: '#dc2626' }
    },
    {
        name: 'Rose',
        value: 'rose',
        light: { primary: 'oklch(0.647 0.247 12.422)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.696 0.263 10.772)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#f43f5e', dark: '#e11d48' }
    },
    {
        name: 'Slate',
        value: 'slate',
        light: { primary: 'oklch(0.556 0.015 253.632)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.605 0.016 253.632)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#64748b', dark: '#475569' }
    },
    {
        name: 'Teal',
        value: 'teal',
        light: { primary: 'oklch(0.725 0.127 193.438)', primaryForeground: 'oklch(0.145 0 0)' },
        dark: { primary: 'oklch(0.777 0.133 193.438)', primaryForeground: 'oklch(0.145 0 0)' },
        preview: { light: '#14b8a6', dark: '#0d9488' }
    },
    {
        name: 'Violet',
        value: 'violet',
        light: { primary: 'oklch(0.607 0.234 293.757)', primaryForeground: 'oklch(0.985 0 0)' },
        dark: { primary: 'oklch(0.656 0.244 292.717)', primaryForeground: 'oklch(0.985 0 0)' },
        preview: { light: '#8b5cf6', dark: '#7c3aed' }
    },
    {
        name: 'Yellow',
        value: 'yellow',
        light: { primary: 'oklch(0.802 0.184 99.586)', primaryForeground: 'oklch(0.145 0 0)' },
        dark: { primary: 'oklch(0.851 0.189 99.178)', primaryForeground: 'oklch(0.145 0 0)' },
        preview: { light: '#eab308', dark: '#ca8a04' }
    },
];

export default function ThemeToggle() {
    const { t } = useTranslation();
    const { availableColorThemes, auth } = usePage<PageProps>().props;
    const [isDark, setIsDark] = useState(false);
    const [colorTheme, setColorTheme] = useState('zinc');

    // Filter themes based on available themes from config
    const filteredThemes = COLOR_THEMES.filter(theme =>
        availableColorThemes.includes(theme.value)
    );

    useEffect(() => {
        // Priority: user config > localStorage > system preference
        const userTheme = auth.user?.config?.theme;
        const userColorTheme = auth.user?.config?.colorTheme;
        const localTheme = localStorage.getItem('theme');
        const localColorTheme = localStorage.getItem('colorTheme');

        // Set color theme
        const activeColorTheme = userColorTheme || localColorTheme || 'zinc';
        setColorTheme(activeColorTheme);
        applyColorTheme(activeColorTheme);

        // Set dark/light theme
        const activeTheme = userTheme || localTheme;
        if (
            activeTheme === 'dark' ||
            (!activeTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const applyColorTheme = (theme: string) => {
        const themeConfig = COLOR_THEMES.find(t => t.value === theme);
        if (themeConfig) {
            const root = document.documentElement;
            const isDarkMode = root.classList.contains('dark');
            const colors = isDarkMode ? themeConfig.dark : themeConfig.light;

            // Apply CSS variables
            root.style.setProperty('--primary', colors.primary);
            root.style.setProperty('--primary-foreground', colors.primaryForeground);
        }
    };

    const updateUserConfig = async (key: string, value: any) => {
        try {
            await axios.post(route('user.config.update'), {
                key,
                value,
            });
        } catch (error) {
            console.error('Failed to update user config:', error);
        }
    };

    const toggleTheme = (checked: boolean) => {
        setIsDark(checked);
        const themeValue = checked ? 'dark' : 'light';

        if (checked) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('theme', themeValue);

        // Save to backend if user is logged in
        if (auth.user) {
            updateUserConfig('theme', themeValue);
        }

        // Reapply color theme to update colors for new mode
        applyColorTheme(colorTheme);
    };

    const handleColorThemeChange = (theme: string) => {
        setColorTheme(theme);
        localStorage.setItem('colorTheme', theme);
        applyColorTheme(theme);

        // Save to backend if user is logged in
        if (auth.user) {
            updateUserConfig('colorTheme', theme);
        }
    };

    return (
        <div className="flex items-center">
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div className="relative inline-flex items-center cursor-context-menu">
                        <Switch
                            checked={isDark}
                            onCheckedChange={toggleTheme}
                            aria-label={t('Toggle theme')}
                            className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-slate-200"
                        />
                        <Sun className={`pointer-events-none absolute left-1 h-3 w-3 text-orange-500 transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-100'}`} />
                        <Moon className={`pointer-events-none absolute right-1 h-3 w-3 text-blue-400 transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                    <ContextMenuLabel>{t('Color Theme')}</ContextMenuLabel>
                    <ContextMenuSeparator />
                    <div className="max-h-[400px] overflow-y-auto">
                        {filteredThemes.map((theme) => (
                            <ContextMenuItem
                                key={theme.value}
                                onClick={() => handleColorThemeChange(theme.value)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div
                                            className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: theme.preview.light }}
                                        />
                                        <div
                                            className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: theme.preview.dark }}
                                        />
                                    </div>
                                    <span>{theme.name}</span>
                                </div>
                                {colorTheme === theme.value && (
                                    <Check className="h-4 w-4" />
                                )}
                            </ContextMenuItem>
                        ))}
                    </div>
                </ContextMenuContent>
            </ContextMenu>
        </div>
    );
}
