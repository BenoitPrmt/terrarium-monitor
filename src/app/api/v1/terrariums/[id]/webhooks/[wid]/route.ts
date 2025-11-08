import {Types} from "mongoose"
import {NextResponse} from "next/server"

import {auth} from "@/auth"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    webhookUpdateSchema,
    type WebhookUpdateInput,
} from "@/lib/validation/webhook"
import {requireTerrariumForOwner} from "@/lib/services/terrariums"
import {WebhookModel, type WebhookDocument} from "@/models/Webhook"

export const runtime = "nodejs"

function serializeWebhook(webhook: WebhookDocument) {
    return {
        id: webhook._id.toString(),
        name: webhook.name,
        url: webhook.url,
        metric: webhook.metric,
        comparator: webhook.comparator,
        threshold: webhook.threshold,
        cooldownSec: webhook.cooldownSec,
        isActive: webhook.isActive,
        secretId: webhook.secretId,
        lastTriggeredAt: webhook.lastTriggeredAt?.toISOString(),
        createdAt: webhook.createdAt?.toISOString(),
        updatedAt: webhook.updatedAt?.toISOString(),
    }
}

export async function PUT(
    request: Request,
    {params}: { params: Promise<{ id: string; wid: string }> }
) {
    const {id, wid} = await params

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    let payload: WebhookUpdateInput
    try {
        payload = webhookUpdateSchema.parse(await request.json())
    } catch {
        return NextResponse.json({error: "invalid_payload"}, {status: 400})
    }

    await connectMongoose()
    await ensureDbIndexes()

    try {
        const terrarium = await requireTerrariumForOwner(id, session.user.id)
        const webhook = await WebhookModel.findOneAndUpdate(
            {_id: new Types.ObjectId(wid), terrariumId: terrarium._id},
            {$set: payload},
            {new: true}
        )

        if (!webhook) {
            return NextResponse.json({error: "not_found"}, {status: 404})
        }

        return NextResponse.json({webhook: serializeWebhook(webhook)})
    } catch {
        return NextResponse.json({error: "not_found"}, {status: 404})
    }
}

export async function DELETE(
    _request: Request,
    {params}: { params: Promise<{ id: string; wid: string }> }
) {
    const {id, wid} = await params

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    await connectMongoose()
    await ensureDbIndexes()

    try {
        const terrarium = await requireTerrariumForOwner(id, session.user.id)
        const result = await WebhookModel.deleteOne({
            _id: new Types.ObjectId(wid),
            terrariumId: terrarium._id,
        })

        if (!result.deletedCount) {
            return NextResponse.json({error: "not_found"}, {status: 404})
        }

        return NextResponse.json({status: "deleted"}, {status: 200})
    } catch {
        return NextResponse.json({error: "not_found"}, {status: 404})
    }
}
