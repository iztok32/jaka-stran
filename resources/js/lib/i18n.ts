import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { props } = usePage();
    const translations = props.translations as Record<string, string>;

    const t = (key: string, replacements: Record<string, string> = {}) => {
        let translation = translations[key] || key;

        Object.keys(replacements).forEach((replacementKey) => {
            translation = translation.replace(
                `:${replacementKey}`,
                replacements[replacementKey],
            );
        });

        return translation;
    };

    return { t, locale: props.locale as string, availableLocales: props.availableLocales as string[] };
}
