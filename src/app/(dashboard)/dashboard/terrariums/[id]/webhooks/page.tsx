import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    requireTerrariumForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums"
import {WebhookModel} from "@/models/Webhook"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {NewWebhookForm} from "@/components/webhooks/NewWebhookForm"
import {WebhookCard} from "@/components/webhooks/WebhookCard"

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function WebhooksPage({params}: PageProps) {
    const user = await currentUser()
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Webhooks</h1>
                <p className="text-muted-foreground">
                    Automatisez des alertes pour {terrarium.name}.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Nouveau webhook</CardTitle>
                </CardHeader>
                <CardContent>
                    <NewWebhookForm terrariumId={terrarium.id}/>
                </CardContent>
            </Card>

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
                        Aucun webhook pour le moment.
                    </p>
                )}
            </div>
        </div>
    )
}
