import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    requireTerrariumForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums"
import {WebhookModel} from "@/models/Webhook"
import {WebhookCard} from "@/components/webhooks/WebhookCard"
import {HealthCheckWebhookRow} from "@/components/webhooks/HealthCheckWebhookRow"
import {WebhookFormDialog} from "@/components/webhooks/WebhookFormDialog"
import {WebhookInfoDialog} from "@/components/webhooks/WebhookInfoDialog"
import {Button} from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import {ArrowUpRightIcon, CirclePlusIcon, WebhookIcon} from "lucide-react";
import {getTranslations} from "next-intl/server";

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function WebhooksPage({params}: PageProps) {
    const user = await currentUser()
    const t = await getTranslations('Webhooks.page');
    if (!user) {
        redirect("/login")
    }
    const {id} = await params;

    await connectMongoose()
    await ensureDbIndexes()

    const terrariumDoc = await requireTerrariumForOwner(id, user.id)
    const terrarium = serializeTerrarium(terrariumDoc)

    const webhooks = await WebhookModel.find({
        terrariumId: terrariumDoc._id,
    })
        .sort({createdAt: -1})
        .lean()

    const healthCheckConfig = terrariumDoc.healthCheck
        ? {
              url: terrariumDoc.healthCheck.url ?? "",
              delayMinutes: terrariumDoc.healthCheck.delayMinutes ?? 60,
              isEnabled: Boolean(terrariumDoc.healthCheck.isEnabled),
              lastTriggeredAt:
                  terrariumDoc.healthCheck.lastTriggeredAt?.toISOString(),
              secretId: terrariumDoc.healthCheck.secretId ?? undefined,
          }
        : {
              url: "",
              delayMinutes: 60,
              isEnabled: false,
              lastTriggeredAt: undefined,
              secretId: undefined,
          }

    return (
        <div className="space-y-6">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                <HealthCheckWebhookRow
                    terrariumId={terrarium.id}
                    config={healthCheckConfig}
                />
                <WebhookFormDialog
                    terrariumId={terrarium.id}
                    mode="create"
                    trigger={
                        <Button className="w-full lg:w-auto">
                            <CirclePlusIcon className="size-4" />
                            {t("newWebhook")}
                        </Button>
                    }
                />
                <WebhookInfoDialog />
            </div>

            <div className="overflow-hidden rounded-lg border bg-background shadow-xs">
                <div className="border-b bg-muted/35 px-4 py-3">
                    <h1 className="text-lg font-semibold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('description', {name: terrarium.name})}
                    </p>
                </div>
                {webhooks.map((webhook) => (
                    <WebhookCard
                        key={webhook._id.toString()}
                        terrariumId={terrarium.id}
                        webhook={{
                            id: webhook._id.toString(),
                            name: webhook.name,
                            url: webhook.url,
                            metric: webhook.metric,
                            comparator: webhook.comparator,
                            threshold: webhook.threshold,
                            cooldownSec: webhook.cooldownSec,
                            isActive: webhook.isActive,
                            bodyPreset: webhook.bodyPreset ?? "default",
                            discordBodyConfig:
                                webhook.discordBodyConfig ?? undefined,
                            customBodyTemplate:
                                webhook.customBodyTemplate ?? undefined,
                            secretId: webhook.secretId ?? undefined,
                            lastTriggeredAt: webhook.lastTriggeredAt?.toISOString(),
                        }}
                    />
                ))}
                {webhooks.length === 0 && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <WebhookIcon />
                            </EmptyMedia>
                            <EmptyTitle>{t("empty.title")}</EmptyTitle>
                            <EmptyDescription>
                                {t("empty.description")}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="flex-row justify-center gap-2">
                            <WebhookFormDialog
                                terrariumId={terrarium.id}
                                mode="create"
                                trigger={
                                    <Button className="w-full lg:w-auto">
                                        <CirclePlusIcon className="size-4" />
                                        {t("newWebhook")}
                                    </Button>
                                }
                            />
                        </EmptyContent>
                    </Empty>
                )}
            </div>
        </div>
    )
}
