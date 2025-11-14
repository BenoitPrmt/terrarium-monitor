import React from 'react';
import Link from 'next/link';
import {WEBSITE_CONTACT_EMAIL, WEBSITE_NAME} from '@/constants/website';
import {Separator} from '@/components/ui/separator';
import {useTranslations} from "next-intl";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('Navigation.Footer');
  
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
              {WEBSITE_NAME}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('tagline')}
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href={`mailto:${WEBSITE_CONTACT_EMAIL}`}
                className="text-sm text-primary hover:underline"
              >
                {WEBSITE_CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('sections.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('links.home')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('links.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('links.login')}
                </Link>
              </li>
            </ul>
          </div>
          

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('sections.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('links.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('links.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('links.legal')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {t('copyright', {year: currentYear, brand: WEBSITE_NAME})}
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <a 
              href="https://linkedin.com/company/octogridapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
