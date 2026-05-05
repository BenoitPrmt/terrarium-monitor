"use client"

import {PencilIcon} from "lucide-react"
import {useTranslations} from "next-intl"

import {HealthCheckWebhookCard} from "@/components/webhooks/HealthCheckWebhookCard"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type HealthCheckConfig = {
    url: string
    delayMinutes: number
    isEnabled: boolean
    lastTriggeredAt?: string | null
    secretId?: string
}

type Props = {
    terrariumId: string
    config: HealthCheckConfig
}

export function HealthCheckWebhookRow({terrariumId, config}: Props) {
    const t = useTranslations("Webhooks.healthCheck")

    return (
        <div className="grid gap-3 rounded-lg border bg-background px-4 py-3 shadow-xs md:grid-cols-[minmax(180px,1fr)_minmax(220px,1.4fr)_auto_auto] md:items-center">
            <div className="min-w-0">
                <p className="truncate text-base font-semibold">{t("summary.name")}</p>
                <p className="text-xs text-muted-foreground">
                    {t("summary.delay", {minutes: config.delayMinutes})}
                </p>
            </div>
            <p className="min-w-0 truncate font-mono text-sm text-muted-foreground">
                {config.url || t("summary.noUrl")}
            </p>
            <Badge
                variant={config.isEnabled ? "default" : "destructive"}
                className="w-fit"
            >
                {config.isEnabled ? t("status.active") : t("status.inactive")}
            </Badge>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={t("actions.edit")}>
                        <PencilIcon className="size-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("dialog.title")}</DialogTitle>
                        <DialogDescription>{t("dialog.description")}</DialogDescription>
                    </DialogHeader>
                    <HealthCheckWebhookCard
                        terrariumId={terrariumId}
                        config={config}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
