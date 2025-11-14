"use client"

import * as React from "react"
import {Moon, MoonIcon, Sun, SunIcon, SunMoonIcon} from "lucide-react"
import {useTheme} from "next-themes"

import {Button} from "@/components/ui/button"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {useTranslations} from "next-intl";

export function ThemeToggle() {
    const {setTheme} = useTheme()
    const t = useTranslations('ThemeToggle');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Sun
                        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                    <Moon
                        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                    <span className="sr-only">
                        {t('label')}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <SunIcon className="mr-2 size-4"/>
                    <p>{t('options.light')}</p>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <MoonIcon className="mr-2 size-4"/>
                    <p>{t('options.dark')}</p>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <SunMoonIcon className="mr-2 size-4"/>
                    <p>{t('options.system')}</p>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
