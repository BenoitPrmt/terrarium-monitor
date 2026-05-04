import {NextResponse} from "next/server"
import {Types} from "mongoose"
import {connectMongoose} from "@/lib/db/mongoose"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {ingestPayloadSchema} from "@/lib/validation/ingest"
import {SampleModel} from "@/models/Sample"
import {TerrariumModel} from "@/models/Terrarium"
import {WebhookModel} from "@/models/Webhook"
import type {MetricType, WebhookComparator} from "@/models/constants"
import {rateLimit, verifyDeviceToken} from "@/lib/utils"
import {clampToIngestionWindow, toUtcDate} from "@/lib/utils/time"
import {updateAggregatesFromSamples} from "@/lib/services/aggregations"
import {buildWebhookPayload, sendWebhookWithRetry} from "@/lib/utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RATE_LIMIT_PER_MINUTE = Number(process.env.INGEST_RATE_PER_MINUTE ?? "120")
const WEBHOOK_SECRET = process.env.WEBHOOK_SIGNATURE_SECRET

if (!WEBHOOK_SECRET) {
    throw new Error("WEBHOOK_SIGNATURE_SECRET must be defined")
}
const WEBHOOK_SECRET_VALUE = WEBHOOK_SECRET as string

const comparatorMap: Record<
    WebhookComparator,
    (value: number, threshold: number) => boolean
> = {
    gt: (value: number, threshold: number) => value > threshold,
    gte: (value: number, threshold: number) => value >= threshold,
    lt: (value: number, threshold: number) => value < threshold,
    lte: (value: number, threshold: number) => value <= threshold,
}

function sanitizeValue(type: MetricType, value: number) {
    if (!Number.isFinite(value)) {
        throw new Error("Invalid value")
    }

    if (type === "HUMIDITY") {
        return Math.min(Math.max(value, 0), 100)
    }

    return value
}

export async function POST(
    request: Request,
    {params}: { params: Promise<{ uuid: string }> }
) {
    const {uuid} = await params;

    console.log("/v1/record/{uuid} called for uuid", uuid);

    if (!uuid) {
        console.log("[/v1/record/{uuid}] Missing uuid, payload :", await request.json());
        return NextResponse.json({error: "missing_uuid"}, {status: 400})
    }

    const token = request.headers.get("x-device-token")
    if (!token) {
        console.log(`[/v1/record/{uuid} - ${uuid}] Missing device token, payload :`, await request.json());
        return NextResponse.json({error: "missing_token"}, {status: 401})
    }

    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const bucketKey = `${uuid}:${ip}`
    if (!rateLimit(bucketKey, RATE_LIMIT_PER_MINUTE, 60_000)) {
        console.log(`[/v1/record/{uuid} - ${uuid}] Rate limited for IP ${ip}`);
        return NextResponse.json({error: "rate_limited"}, {status: 429})
    }

    let payload
    try {
        payload = ingestPayloadSchema.parse(await request.json())
    } catch (error) {
        console.log(`[/v1/record/{uuid} - ${uuid}] Invalid payload, error:`, error, "payload:", await request.json());
        return NextResponse.json({error: "invalid_payload"}, {status: 400})
    }

    await connectMongoose()
    await ensureDbIndexes()

    const terrarium = await TerrariumModel.findOne({uuid})
    if (!terrarium) {
        console.log(`[/v1/record/{uuid} - ${uuid}] Terrarium not found, payload:`, payload);
        return NextResponse.json({error: "not_found"}, {status: 404})
    }

    const tokenValid = verifyDeviceToken(token, terrarium.deviceTokenHash)
    if (!tokenValid) {
        console.log(`[/v1/record/{uuid} - ${uuid}] Invalid device token, payload:`, payload);
        return NextResponse.json({error: "invalid_token"}, {status: 401})
    }

    const sentAt = payload.sent_at
        ? toUtcDate(payload.sent_at)
        : new Date()

    let samples
    try {
        samples = payload.samples.map((sample) => {
            const ts = clampToIngestionWindow(toUtcDate(sample.t))
            if (Number.isNaN(ts.getTime())) {
                throw new Error("Invalid timestamp")
            }
            return {
                terrariumId: terrarium._id,
                deviceId: payload.device_id,
                ts,
                type: sample.type,
                unit: sample.unit,
                value: sanitizeValue(sample.type, sample.value),
                sentAt,
            }
        })
    } catch {
        console.log(`[/v1/record/{uuid} - ${uuid}] Invalid samples in payload:`, payload);
        return NextResponse.json({error: "invalid_samples"}, {status: 400})
    }

    const inserted = await SampleModel.insertMany(samples, {
        ordered: false,
    })

    const sampleLike = inserted.map((doc) => ({
        terrariumId: doc.terrariumId as Types.ObjectId,
        type: doc.type as MetricType,
        ts: doc.ts,
        value: doc.value,
    }))

    const aggregatesPromise = updateAggregatesFromSamples(sampleLike).catch(
        (error) => {
            console.error("Failed to update aggregates", error)
        }
    )

    const webhookPromise = triggerWebhooks(
        {id: terrarium._id, name: terrarium.name},
        inserted
    ).catch(
        (error) => {
            console.error("Failed to trigger webhooks", error)
        }
    )

    await Promise.all([aggregatesPromise, webhookPromise])

    if (terrarium.healthCheck?.lastTriggeredAt) {
        await TerrariumModel.updateOne(
            {
                _id: terrarium._id,
                "healthCheck.lastTriggeredAt": {$ne: null},
            },
            {
                $set: {"healthCheck.lastTriggeredAt": null},
            }
        )
    }

    return NextResponse.json(
        {status: "accepted", ingested: inserted.length},
        {status: 202}
    )
}

async function triggerWebhooks(
    terrarium: {id: Types.ObjectId; name: string},
    samples: Awaited<ReturnType<typeof SampleModel.insertMany>>
) {
    if (!samples.length) {
        return
    }

    const metrics = Array.from(new Set(samples.map((s) => s.type)))

    const webhooks = await WebhookModel.find({
        terrariumId: terrarium.id,
        metric: {$in: metrics},
        isActive: true,
    })

    if (!webhooks.length) {
        return
    }

    const samplesByMetric = new Map<string, typeof samples>()
    for (const metric of metrics) {
        samplesByMetric.set(
            metric,
            samples.filter((sample) => sample.type === metric)
        )
    }

    for (const webhook of webhooks) {
        const metricSamples = samplesByMetric.get(webhook.metric) ?? []
        const comparator = comparatorMap[webhook.comparator]

        if (!comparator) {
            continue
        }

        const matchedSample = metricSamples.find((sample) =>
            comparator(sample.value, webhook.threshold)
        )

        if (!matchedSample) {
            continue
        }

        if (webhook.lastTriggeredAt) {
            const diff =
                Date.now() - new Date(webhook.lastTriggeredAt).getTime()
            if (diff < webhook.cooldownSec * 1000) {
                continue
            }
        }

        let payload
        try {
            payload = buildWebhookPayload(
                {
                    bodyPreset: webhook.bodyPreset,
                    discordBodyConfig: webhook.discordBodyConfig,
                    customBodyTemplate: webhook.customBodyTemplate,
                },
                {
                    terrarium: {
                        id: terrarium.id.toString(),
                        name: terrarium.name,
                    },
                    metric: webhook.metric,
                    comparator: webhook.comparator,
                    threshold: webhook.threshold,
                    current: matchedSample.value,
                    at: matchedSample.ts.toISOString(),
                    samplesCountInBatch: metricSamples.length,
                }
            )
        } catch (error) {
            console.error("Failed to build webhook payload", {
                webhookId: webhook._id.toString(),
                error,
            })
            continue
        }

        const delivered = await sendWebhookWithRetry(
            webhook.url,
            payload,
            {
                terrariumId: terrarium.id.toString(),
                metric: webhook.metric,
                signatureSecret: WEBHOOK_SECRET_VALUE,
                secretId: webhook.secretId ?? undefined,
            },
            3
        )

        if (delivered) {
            webhook.lastTriggeredAt = new Date()
            await webhook.save()
        }
    }
}
