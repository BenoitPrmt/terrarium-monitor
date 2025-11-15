"use client";
import {Grid2X2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ShinyButton} from "@/components/ui/shiny-button";
import {User} from "next-auth";
import Link from "next/link";
import {ThemeToggle} from "@/components/theme/ThemeToggle";
import {WEBSITE_NAME} from "@/constants/website";
import {useTranslations} from "next-intl";
import LanguageSelector from "@/components/locale/LanguageSelector";

type HeaderProps = {
    session: User | null;
};

const Header = ({session}: HeaderProps) => {
    const t = useTranslations('Navigation.Header');
    const isAuthenticated = !!session;

    return (
        <nav className="container mx-auto py-6 px-4 flex justify-between items-center border-b">
            <div
                className="text-2xl font-bold bg-linear-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                <Link href="/">{WEBSITE_NAME}</Link>
            </div>
            <div className="space-x-4 flex flex-row items-center">

                <LanguageSelector />
                <ThemeToggle/>

                {isAuthenticated && (
                    <Button onClick={() => window.location.href = '/dashboard'}>
                        <Grid2X2/> {t('links.dashboard')}
                    </Button>
                )}

                {!isAuthenticated &&
                    <ShinyButton onClick={() => window.location.href = '/login'}>{t('links.login')}</ShinyButton>
                }

            </div>
        </nav>
    );
};

export default Header;
