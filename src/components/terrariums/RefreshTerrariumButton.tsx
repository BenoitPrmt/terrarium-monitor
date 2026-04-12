"use client"

import {useRouter} from "next/navigation"
import {useTransition} from "react"
import {RefreshCwIcon} from "lucide-react"
import {useTranslations} from "next-intl"

import {Button} from "@/components/ui/button"

export default function RefreshTerrariumButton() {
    const router = useRouter()
    const t = useTranslations("Terrariums.header.actions")
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="outline"
            type="button"
            disabled={isPending}
            onClick={() => {
                startTransition(() => {
                    router.refresh()
                })
            }}
        >
            <RefreshCwIcon className={isPending ? "size-4 animate-spin" : "size-4"}/>
            {t("refresh")}
        </Button>
    )
}
