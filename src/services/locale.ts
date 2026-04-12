'use server';

import {cookies} from 'next/headers';
import {Locale, defaultLocale, isLocale} from '@/i18n/config';

const COOKIE_NAME = 'NEXT_LOCALE';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function getUserLocale() {
    const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value;
    return cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;
}

export async function setUserLocale(locale: Locale) {
    (await cookies()).set(COOKIE_NAME, locale, {
        path: '/',
        sameSite: 'lax',
        maxAge: ONE_YEAR_IN_SECONDS,
        secure: process.env.NODE_ENV === 'production',
    });
}
