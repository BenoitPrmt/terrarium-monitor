"use client"

import {signOut} from "next-auth/react"
import {Button} from "@/components/ui/button"
import {useTranslations} from "next-intl";

export function LogoutButton() {
    const t = useTranslations('Navigation.User');
    return (
        <Button
            variant="ghost"
            onClick={() => signOut({callbackUrl: "/"})}
        >
            {t('logout')}
        </Button>
    )
}
