"use client"

import {PencilIcon, SendIcon, Trash2Icon} from "lucide-react"
import {useLocale, useTranslations} from "next-intl"

import {WebhookDeleteDialog} from "@/components/webhooks/WebhookDeleteDialog"
import {WebhookFormDialog} from "@/components/webhooks/WebhookFormDialog"
import {WebhookTestDialog} from "@/components/webhooks/WebhookTestDialog"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import type {MetricType} from "@/models/constants"

type Props = {
    terrariumId: string
    webhook: {
        id: string
        name: string
        url: string
        metric: MetricType
        comparator: string
        threshold: number
        cooldownSec: number
        isActive: boolean
        secretId?: string
        lastTriggeredAt?: string
    }
}

export function WebhookCard({terrariumId, webhook}: Props) {
    const t = useTranslations("Webhooks.card")
    const metricsT = useTranslations("Common.metrics")
    const locale = useLocale()
    const metricLabel = metricsT(webhook.metric.toLowerCase() as never)
    const formatter = new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    })

    return (
        <div className="grid gap-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[minmax(180px,1fr)_minmax(220px,1.4fr)_auto_auto] md:items-center">
            <div className="min-w-0">
                <p className="truncate text-base font-semibold">{webhook.name}</p>
                <p className="text-xs text-muted-foreground">
                    {metricLabel} {webhook.comparator} {webhook.threshold}
                </p>
            </div>
            <div className="min-w-0">
                <p className="truncate font-mono text-sm text-muted-foreground">
                    {webhook.url}
                </p>
                {webhook.lastTriggeredAt && (
                    <p className="text-xs text-muted-foreground">
                        {t("lastTriggered", {
                            date: formatter.format(new Date(webhook.lastTriggeredAt)),
                        })}
                    </p>
                )}
            </div>
            <Badge
                variant={webhook.isActive ? "default" : "destructive"}
                className="w-fit"
            >
                {webhook.isActive ? t("status.active") : t("status.inactive")}
            </Badge>
            <div className="flex items-center gap-1 md:justify-end">
                <WebhookTestDialog
                    terrariumId={terrariumId}
                    webhook={{
                        id: webhook.id,
                        metric: webhook.metric,
                        comparator: webhook.comparator,
                        threshold: webhook.threshold,
                    }}
                    trigger={
                        <Button variant="ghost" size="icon" aria-label={t("actions.test")}>
                            <SendIcon className="size-4" />
                        </Button>
                    }
                />
                <WebhookFormDialog
                    terrariumId={terrariumId}
                    mode="edit"
                    webhook={webhook}
                    trigger={
                        <Button variant="ghost" size="icon" aria-label={t("actions.edit")}>
                            <PencilIcon className="size-4" />
                        </Button>
                    }
                />
                <WebhookDeleteDialog
                    terrariumId={terrariumId}
                    webhookId={webhook.id}
                    webhookName={webhook.name}
                    isActive={webhook.isActive}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("actions.delete")}
                        >
                            <Trash2Icon className="size-4" />
                        </Button>
                    }
                />
            </div>
        </div>
    )
}
