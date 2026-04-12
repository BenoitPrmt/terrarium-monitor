"use client";
import {Grid2X2, Leaf} from "lucide-react";
import {Button} from "@/components/ui/button";
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
        <header className="border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/55">
            <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Leaf className="size-5"/>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-semibold tracking-tight text-foreground">
                            {WEBSITE_NAME}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            terrarium monitor
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <LanguageSelector />
                <ThemeToggle/>

                {isAuthenticated && (
                    <Button asChild>
                        <Link href="/dashboard">
                            <Grid2X2 className="size-4"/> {t('links.dashboard')}
                        </Link>
                    </Button>
                )}

                    {!isAuthenticated && (
                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                            <Link href="/login">{t('links.login')}</Link>
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
