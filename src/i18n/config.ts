export type Locale = (typeof locales)[number];

export const locales = ['en', 'fr', 'de'] as const;

export function getLocaleFlag(locale: Locale) {
    switch (locale) {
        case 'en':
            return '🇺🇸';
        case 'fr':
            return '🇫🇷';
        case 'de':
            return '🇩🇪';
        default:
            return '🏳️';
    }
}

export const defaultLocale: Locale = 'fr';