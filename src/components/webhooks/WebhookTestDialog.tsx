"use client"

import {type ReactNode, useMemo, useState, useTransition} from "react"
import {Loader2Icon, SendIcon} from "lucide-react"
import {toast} from "sonner"
import {useTranslations} from "next-intl"

import {testWebhookAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {WebhookBodyPreview} from "@/components/webhooks/WebhookBodyPreview"
import {
    buildWebhookPayload,
    type DiscordBodyConfigInput,
    type WebhookBodyPreset,
} from "@/lib/utils/webhook-payload"
import type {MetricType} from "@/models/constants"

type WebhookTestPayload = Record<string, unknown>

type Props = {
    terrariumId: string
    webhook: {
        id: string
        metric: MetricType
        comparator: string
        threshold: number
        bodyPreset?: WebhookBodyPreset
        discordBodyConfig?: DiscordBodyConfigInput
        customBodyTemplate?: string
    }
    trigger: ReactNode
}

function getDefaultTestValue(threshold: number, comparator: string) {
    return comparator === "lt" || comparator === "lte"
        ? threshold - 1
        : threshold + 1
}

export function WebhookTestDialog({terrariumId, webhook, trigger}: Props) {
    const t = useTranslations("Webhooks.card")
    const [open, setOpen] = useState(false)
    const [testValue, setTestValue] = useState(() =>
        String(getDefaultTestValue(webhook.threshold, webhook.comparator))
    )
    const [lastPayload, setLastPayload] = useState<WebhookTestPayload | null>(null)
    const [pending, startTransition] = useTransition()

    const previewPayload = useMemo<WebhookTestPayload>(() => {
        if (lastPayload) {
            return lastPayload
        }

        try {
            return buildWebhookPayload(
                {
                    bodyPreset: webhook.bodyPreset,
                    discordBodyConfig: webhook.discordBodyConfig,
                    customBodyTemplate: webhook.customBodyTemplate,
                },
                {
                    terrarium: {
                        id: terrariumId,
                        name: "Terrarium",
                    },
                    metric: webhook.metric,
                    comparator: webhook.comparator,
                    threshold: webhook.threshold,
                    current: Number.isFinite(Number(testValue))
                        ? Number(testValue)
                        : webhook.threshold,
                    at: new Date().toISOString(),
                    samplesCountInBatch: 1,
                }
            )
        } catch {
            return {error: t("body.invalidJson")}
        }
    }, [lastPayload, terrariumId, testValue, webhook, t])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("test.dialogTitle")}</DialogTitle>
                    <DialogDescription>{t("test.description")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`test-current-${webhook.id}`}>
                            {t("test.fields.current")}
                        </Label>
                        <Input
                            id={`test-current-${webhook.id}`}
                            type="number"
                            step="0.1"
                            value={testValue}
                            onChange={(event) => {
                                setLastPayload(null)
                                setTestValue(event.target.value)
                            }}
                        />
                    </div>
                    <WebhookBodyPreview
                        title={t("body.title")}
                        description={t("body.description")}
                        payload={previewPayload}
                    />
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                            startTransition(async () => {
                                const formData = new FormData()
                                formData.set("current", testValue)

                                const result = await testWebhookAction(
                                    terrariumId,
                                    webhook.id,
                                    formData
                                )

                                if (result.data?.payload) {
                                    setLastPayload(
                                        result.data.payload as WebhookTestPayload
                                    )
                                }

                                if (result.success) {
                                    toast.success(result.message)
                                } else {
                                    toast.error(result.message)
                                }
                            })
                        }
                    >
                        {pending ? (
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <SendIcon className="size-4" />
                        )}
                        {pending ? t("actions.testing") : t("actions.test")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
