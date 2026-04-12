import React from 'react';
import {Github, Mail} from 'lucide-react';
import {WEBSITE_CONTACT_EMAIL, WEBSITE_NAME} from '@/constants/website';
import {Separator} from '@/components/ui/separator';
import {useTranslations} from "next-intl";

const REPOSITORY_URL = "https://github.com/BenoitPrmt/terrarium-monitor";

export const Footer = () => {
    const currentYear = new Date().getFullYear();
    const t = useTranslations('Navigation.Footer');

    return (
        <footer
            className="border-t border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/55">
            <div className="mx-auto w-full max-w-5xl px-4 py-8">
                <div className="flex flex-row justify-between items-center gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                            {WEBSITE_NAME}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('tagline')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={`mailto:${WEBSITE_CONTACT_EMAIL}`}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Mail className="size-4"/>
                            {WEBSITE_CONTACT_EMAIL}
                        </a>
                        <a
                            href={REPOSITORY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Github className="size-4"/>
                            GitHub
                        </a>
                    </div>
                </div>

                <Separator className="my-6"/>

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                        {t('copyright', {year: currentYear, brand: WEBSITE_NAME})}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground md:mt-0">
                        open source terrarium dashboard
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 
