import React from 'react';
import {setUserLocale} from "@/services/locale";
import {getLocaleFlag, Locale, locales} from "@/i18n/config";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useLocale, useTranslations} from "next-intl";

const LanguageSelector = () => {
    const locale = useLocale();
    const t = useTranslations('Navigation.User');

    return (
        <Select
            defaultValue={locale}
            aria-label={t('languageSelector')}
            onValueChange={async (value) => {
                await setUserLocale(value as Locale)
            }}
        >
            <SelectTrigger
                className="w-[60px] h-8 px-2 cursor-pointer"
            >
                <SelectValue/>
            </SelectTrigger>

            <SelectContent className="min-w-[60px]">
                {locales.map(locale => (
                    <SelectItem
                        key={locale}
                        value={locale}
                        aria-label={locale}
                        className="text-center mx-auto cursor-pointer justify-center [&>span:first-child]:hidden [&>span]:text-center [&>span]:w-full pr-0 pl-0"
                    >
                        <span className="text-xl mx-auto">{getLocaleFlag(locale)}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default LanguageSelector;