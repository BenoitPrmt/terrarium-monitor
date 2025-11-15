import {NextResponse} from "next/server"

import {connectMongoose} from "@/lib/db/mongoose"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {TerrariumModel} from "@/models/Terrarium"
import {SampleModel} from "@/models/Sample"
import {sendWebhookWithRetry} from "@/lib/utils/webhook"

export const runtime = "nodejs"

const rawWebhookSecret = process.env.WEBHOOK_SIGNATURE_SECRET
if (!rawWebhookSecret) {
    throw new Error("WEBHOOK_SIGNATURE_SECRET must be defined")
}
const WEBHOOK_SECRET_VALUE: string = rawWebhookSecret

const CRON_SECRET = process.env.HEALTHCHECK_CRON_SECRET

function isAuthorized(request: Request) {
    if (!CRON_SECRET) {
        return true
    }

    const authHeader = request.headers.get("authorization") ?? ""
    if (!authHeader?.startsWith("Bearer ")) {
        return false
    }

    const token = authHeader.slice(7)
    return token === CRON_SECRET
}

export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    await connectMongoose()
    await ensureDbIndexes()

    const terrariums = await TerrariumModel.find(
        {
            "healthCheck.isEnabled": true,
            "healthCheck.url": {$exists: true, $ne: ""},
            "healthCheck.delayMinutes": {$gt: 0},
        },
        {
            name: 1,
            healthCheck: 1,
        }
    ).lean()

    if (!terrariums.length) {
        return NextResponse.json({checked: 0, triggered: 0})
    }

    const terrariumIds = terrariums.map((terrarium) => terrarium._id)
    const lastSamples = await SampleModel.aggregate<{
        _id: typeof terrariumIds[number]
        lastTs: Date
    }>([
        {$match: {terrariumId: {$in: terrariumIds}}},
        {$sort: {ts: -1}},
        {
            $group: {
                _id: "$terrariumId",
                lastTs: {$first: "$ts"},
            },
        },
    ])

    const lastSampleMap = new Map<string, Date>()
    for (const item of lastSamples) {
        lastSampleMap.set(item._id.toString(), item.lastTs)
    }

    let triggered = 0
    const now = new Date()

    for (const terrarium of terrariums) {
        const config = terrarium.healthCheck
        if (!config?.isEnabled || !config.url || !config.delayMinutes) {
            continue
        }

        if (config.lastTriggeredAt) {
            continue
        }

        const terrariumId = terrarium._id.toString()
        const lastTs = lastSampleMap.get(terrariumId)
        if (!lastTs) {
            continue
        }

        const downtimeMs = now.getTime() - new Date(lastTs).getTime()
        if (downtimeMs < config.delayMinutes * 60_000) {
            continue
        }

        const downtimeMinutes = Math.floor(downtimeMs / 60_000)
        const payload = {
            terrariumId,
            event: "HEALTH_CHECK",
            name: terrarium.name,
            downSince: lastTs.toISOString(),
            downtimeMinutes,
            thresholdMinutes: config.delayMinutes,
            triggeredAt: now.toISOString(),
        }

        const delivered = await sendWebhookWithRetry(
            config.url,
            payload,
            {
                terrariumId,
                metric: "HEALTH_CHECK",
                signatureSecret: WEBHOOK_SECRET_VALUE,
                secretId: config.secretId ?? undefined,
            },
            3
        )

        if (delivered) {
            await TerrariumModel.updateOne(
                {
                    _id: terrarium._id,
                },
                {
                    $set: {"healthCheck.lastTriggeredAt": now},
                }
            )
            triggered += 1
        }
    }

    return NextResponse.json({
        checked: terrariums.length,
        triggered,
    })
}
