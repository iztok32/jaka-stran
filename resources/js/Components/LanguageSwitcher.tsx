import Dropdown from '@/Components/Dropdown';
import { useTranslation } from '@/lib/i18n';
import { router } from '@inertiajs/react';

export default function LanguageSwitcher() {
    const { locale, availableLocales } = useTranslation();

    const switchLanguage = (lang: string) => {
        router.post(route('locale.update'), { locale: lang }, {
            preserveScroll: true,
        });
    };

    const languageNames: Record<string, string> = {
        sl: 'Slovenščina',
        en: 'English',
        de: 'Deutsch',
        it: 'Italiano',
        hr: 'Hrvatski',
    };

    const flagImages: Record<string, string> = {
        sl: '/images/flags/si.png',
        en: '/images/flags/gb.png',
        de: '/images/flags/de.png',
        it: '/images/flags/it.png',
        hr: '/images/flags/hr.png',
    };

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <span className="inline-flex rounded-md">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-transparent bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-gray-500 dark:text-gray-400 transition duration-150 ease-in-out hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none uppercase"
                    >
                        {flagImages[locale] && (
                            <img
                                src={flagImages[locale]}
                                alt={locale}
                                className="me-2 h-3 w-5 object-cover shadow-sm"
                            />
                        )}
                        {locale}
                        <svg
                            className="-me-0.5 ms-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </span>
            </Dropdown.Trigger>

            <Dropdown.Content>
                {availableLocales.map((lang) => (
                    <button
                        key={lang}
                        onClick={() => switchLanguage(lang)}
                        className={`flex w-full items-center px-4 py-2 text-start text-sm leading-5 text-gray-700 dark:text-gray-300 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none ${
                            locale === lang ? 'bg-gray-50 dark:bg-gray-800 font-bold' : ''
                        }`}
                    >
                        {flagImages[lang] && (
                            <img
                                src={flagImages[lang]}
                                alt={lang}
                                className="me-3 h-3 w-5 object-cover shadow-sm"
                            />
                        )}
                        {languageNames[lang] || lang.toUpperCase()}
                    </button>
                ))}
            </Dropdown.Content>
        </Dropdown>
    );
}
