import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    requireTerrariumForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums"
import {WebhookModel} from "@/models/Webhook"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {NewWebhookForm} from "@/components/webhooks/NewWebhookForm"
import {WebhookCard} from "@/components/webhooks/WebhookCard"
import {HealthCheckWebhookCard} from "@/components/webhooks/HealthCheckWebhookCard"
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
            <div>
                <h1 className="text-2xl font-semibold">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('description', {name: terrarium.name})}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('newWebhook')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <NewWebhookForm terrariumId={terrarium.id}/>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('healthCheck.title')}</CardTitle>
                        <CardDescription>
                            {t('healthCheck.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HealthCheckWebhookCard
                            terrariumId={terrarium.id}
                            config={healthCheckConfig}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
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
                            secretId: webhook.secretId ?? undefined,
                            lastTriggeredAt: webhook.lastTriggeredAt?.toISOString(),
                        }}
                    />
                ))}
                {webhooks.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        {t('empty')}
                    </p>
                )}
            </div>
        </div>
    )
}
