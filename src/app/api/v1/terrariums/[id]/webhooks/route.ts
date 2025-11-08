import {NextResponse} from "next/server"

import {auth} from "@/auth"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    webhookCreateSchema,
    type WebhookCreateInput,
} from "@/lib/validation/webhook"
import {requireTerrariumForOwner} from "@/lib/services/terrariums"
import {WebhookModel, type WebhookDocument} from "@/models/Webhook"
import {generateUuid} from "@/lib/utils"

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

export async function GET(
    _request: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    await connectMongoose()
    await ensureDbIndexes()

    let terrarium
    try {
        terrarium = await requireTerrariumForOwner(id, session.user.id)
    } catch {
        return NextResponse.json({error: "not_found"}, {status: 404})
    }

    const webhooks = await WebhookModel.find({
        terrariumId: terrarium._id,
    }).sort({createdAt: -1})

    return NextResponse.json({
        webhooks: webhooks.map((w) => serializeWebhook(w)),
    })
}

export async function POST(
    request: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    let payload: WebhookCreateInput
    try {
        payload = webhookCreateSchema.parse(await request.json())
    } catch {
        return NextResponse.json({error: "invalid_payload"}, {status: 400})
    }

    await connectMongoose()
    await ensureDbIndexes()

    let terrarium
    try {
        terrarium = await requireTerrariumForOwner(id, session.user.id)
    } catch {
        return NextResponse.json({error: "not_found"}, {status: 404})
    }

    const webhook = await WebhookModel.create({
        terrariumId: terrarium._id,
        name: payload.name,
        url: payload.url,
        metric: payload.metric,
        comparator: payload.comparator,
        threshold: payload.threshold,
        cooldownSec: payload.cooldownSec ?? 900,
        isActive: payload.isActive ?? true,
        secretId: payload.secretId ?? generateUuid(),
    })

    return NextResponse.json({webhook: serializeWebhook(webhook)}, {status: 201})
}
