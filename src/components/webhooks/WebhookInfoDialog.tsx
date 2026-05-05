"use client"

import {InfoIcon} from "lucide-react"
import {useTranslations} from "next-intl"

import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {WebhookBodyPreview} from "@/components/webhooks/WebhookBodyPreview"

const examplePayload = {
    terrariumId: "665f4b7a2f1d2d0000000000",
    metric: "HUMIDITY",
    comparator: "gt",
    threshold: 70,
    current: 74.2,
    at: "2026-05-04T12:30:00.000Z",
    samplesCountInBatch: 1,
}

export function WebhookInfoDialog() {
    const t = useTranslations("Webhooks.infoDialog")

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon-lg" aria-label={t("trigger")}>
                    <InfoIcon className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3 rounded-md border p-3 text-sm md:grid-cols-2">
                        <div>
                            <p className="font-medium">{t("request.title")}</p>
                            <p className="text-muted-foreground">
                                {t("request.description")}
                            </p>
                        </div>
                        <div>
                            <p className="font-medium">{t("status.title")}</p>
                            <p className="text-muted-foreground">
                                {t("status.description")}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-md border p-3">
                        <p className="mb-2 text-sm font-medium">{t("headers.title")}</p>
                        <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-[160px_1fr]">
                            <dt className="font-mono text-xs">Content-Type</dt>
                            <dd>application/json</dd>
                            <dt className="font-mono text-xs">X-Terrarium-Id</dt>
                            <dd>{t("headers.terrariumId")}</dd>
                            <dt className="font-mono text-xs">X-Metric</dt>
                            <dd>{t("headers.metric")}</dd>
                            <dt className="font-mono text-xs">X-Signature</dt>
                            <dd>{t("headers.signature")}</dd>
                            <dt className="font-mono text-xs">X-Secret-Id</dt>
                            <dd>{t("headers.secretId")}</dd>
                        </dl>
                    </div>
                    <WebhookBodyPreview
                        title={t("body.title")}
                        description={t("body.description")}
                        payload={examplePayload}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
