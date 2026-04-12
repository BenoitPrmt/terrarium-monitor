export type Locale = (typeof locales)[number];

export const locales = ['en', 'fr'] as const;

export function isLocale(value: string): value is Locale {
    return locales.includes(value as Locale);
}

export function getLocaleFlag(locale: Locale) {
    switch (locale) {
        case 'en':
            return '🇺🇸';
        case 'fr':
            return '🇫🇷';
        default:
            return '🏳️';
    }
}

export const defaultLocale: Locale = 'en';
