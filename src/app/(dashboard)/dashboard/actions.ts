"use server"

import {revalidatePath} from "next/cache"

import {auth} from "@/auth"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {serializeTerrariumAction} from "@/lib/services/terrariumActions"
import {
    terrariumCreateSchema,
    terrariumUpdateSchema,
} from "@/lib/validation/terrarium"
import {
    webhookCreateSchema,
    webhookUpdateSchema,
} from "@/lib/validation/webhook"
import {terrariumActionCreateSchema} from "@/lib/validation/terrarium-action"
import {
    requireTerrariumForOwner,
    serializeTerrarium,
    toObjectId,
} from "@/lib/services/terrariums"
import {TerrariumModel} from "@/models/Terrarium"
import {WebhookModel} from "@/models/Webhook"
import {SampleModel} from "@/models/Sample"
import {AggregateHourlyModel} from "@/models/AggregateHourly"
import {AggregateDailyModel} from "@/models/AggregateDaily"
import {AggregateByHourOfDayModel} from "@/models/AggregateByHourOfDay"
import {TerrariumActionModel} from "@/models/TerrariumAction"
import {generateUuid, hashDeviceToken, sendWebhookWithRetry} from "@/lib/utils"
import {createTranslator} from "next-intl";
import {getUserLocale} from "@/services/locale";

type ActionResult<T = any> = {
    success: boolean
    message: string
    data?: T
}

async function requireAuth() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("UNAUTHORIZED")
    }
    return session.user.id
}

async function getActionsTranslator() {
    const locale = await getUserLocale();
    const messages = (await import(`@/locales/${locale}.json`)).default;
    return createTranslator({locale, messages, namespace: "Actions"});
}

export async function createTerrariumAction(formData: FormData): Promise<ActionResult> {
    const ownerId = await requireAuth()
    await connectMongoose()
    await ensureDbIndexes()
    const t = await getActionsTranslator();

    const payload = {
        name: formData.get("name"),
        location: formData.get("location") || undefined,
        description: formData.get("description") || undefined,
    }

    const parsed = terrariumCreateSchema.safeParse(payload)
    if (!parsed.success) {
        return {success: false, message: t('terrarium.create.invalidPayload')}
    }

    const uuid = generateUuid()
    const deviceToken = generateUuid()

    const terrarium = await TerrariumModel.create({
        ownerId: toObjectId(ownerId),
        uuid,
        name: parsed.data.name,
        location: parsed.data.location,
        description: parsed.data.description,
        deviceTokenHash: hashDeviceToken(deviceToken),
    })

    revalidatePath("/dashboard");

    return {
        success: true,
        message: t('terrarium.create.success'),
        data: {terrarium: serializeTerrarium(terrarium), deviceToken},
    }
}

export async function updateTerrariumAction(
    terrariumId: string,
    formData: FormData
): Promise<ActionResult> {
    const ownerId = await requireAuth()
    await connectMongoose()
    await ensureDbIndexes()
    const t = await getActionsTranslator();

    const payload = {
        name: formData.get("name") || undefined,
        location: formData.get("location") || undefined,
        description: formData.get("description") || undefined,
        regenerateToken: formData.get("regenerateToken") === "true",
    }

    const parsed = terrariumUpdateSchema.safeParse(payload)
    if (!parsed.success) {
        return {success: false, message: t('terrarium.update.invalidPayload')}
    }

    const terrarium = await requireTerrariumForOwner(terrariumId, ownerId)

    const update: Record<string, unknown> = {}
    if (parsed.data.name) update.name = parsed.data.name
    if (parsed.data.location !== undefined) update.location = parsed.data.location
    if (parsed.data.description !== undefined)
        update.description = parsed.data.description

    let newToken: string | undefined
    if (parsed.data.regenerateToken) {
        newToken = generateUuid()
        update.deviceTokenHash = hashDeviceToken(newToken)
    }

    const updated = await TerrariumModel.findByIdAndUpdate(
        terrarium._id,
        {$set: update},
        {new: true}
    )

    revalidatePath(`/dashboard/terrariums/${terrariumId}`)
    revalidatePath("/dashboard")

    return {
        success: true,
        message: t('terrarium.update.success'),
        data: {terrarium: updated ? serializeTerrarium(updated) : null, deviceToken: newToken},
    }
}

export async function logTerrariumCareAction(
    terrariumId: string,
    formData: FormData
): Promise<ActionResult> {
    const ownerId = await requireAuth()
    await connectMongoose()
    await ensureDbIndexes()
    const t = await getActionsTranslator();

    const payload = {
        type: formData.get("type"),
        notes: formData.get("notes"),
    }

    const parsed = terrariumActionCreateSchema.safeParse(payload)
    if (!parsed.success) {
        return {
            success: false,
            message: t('terrarium.log.invalidPayload'),
        }
    }

    const terrarium = await requireTerrariumForOwner(terrariumId, ownerId)

    const action = await TerrariumActionModel.create({
        terrariumId: terrarium._id,
        type: parsed.data.type,
        notes: parsed.data.notes,
        performedAt: new Date(),
    })

    revalidatePath(`/dashboard/terrariums/${terrariumId}`)

    return {
        success: true,
        message: t('terrarium.log.success'),
        data: {action: serializeTerrariumAction(action)},
    }
}

export async function deleteTerrariumAction(terrariumId: string): Promise<ActionResult> {
    const ownerId = await requireAuth()
    await connectMongoose()
    await ensureDbIndexes()
    const t = await getActionsTranslator();

    const terrarium = await requireTerrariumForOwner(terrariumId, ownerId)
    await Promise.all([
        SampleModel.deleteMany({terrariumId: terrarium._id}),
        AggregateHourlyModel.deleteMany({terrariumId: terrarium._id}),
        AggregateDailyModel.deleteMany({terrariumId: terrarium._id}),
        AggregateByHourOfDayModel.deleteMany({terrariumId: terrarium._id}),
        WebhookModel.deleteMany({terrariumId: terrarium._id}),
        TerrariumModel.deleteOne({_id: terrarium._id}),
    ])

    revalidatePath("/dashboard")

    return {success: true, message: t('terrarium.delete.success')};
}

export async function createWebhookAction(
    terrariumId: string,
    formData: FormData
): Promise<ActionResult> {
    const ownerId = await requireAuth()
    await connectMongoose()
    await ensureDbIndexes()
    const t = await getActionsTranslator();

    const payload = {
        name: formData.get("name"),
        url: formData.get("url"),
        metric: formData.get("metric"),
        comparator: formData.get("comparator"),
        threshold: Number(formData.get("threshold")),
        cooldownSec: Number(formData.get("cooldownSec")) || undefined,
        isActive: formData.get("isActive") === "true",
    }

    const parsed = webhookCreateSchema.safeParse(payload)
    if (!parsed.success) {
        return {success: false, message: t('webhook.create.invalidPayload')}
    }

    const terrarium = await requireTerrariumForOwner(terrariumId, ownerId)

    const webhook = await WebhookModel.create({
        terrariumId: terrarium._id,
        ...parsed.data,
        secretId: parsed.data.secretId ?? generateUuid(),
    })

    revalidatePath(`/dashboard/terrariums/${terrariumId}/webhooks`)

    return {success: true, message: t('webhook.create.success'), data: webhook.toObject()}
}

export async function updateWebhookAction(
    terrariumId: string,
    webhookId: string,
    formData: FormData
): Promise<ActionResult> {
    const ownerId = await requireAuth()
    await connectMongoose()
    await ensureDbIndexes()
    const t = await getActionsTranslator();

    const payload = {
        name: formData.get("name") || undefined,
        url: formData.get("url") || undefined,
        metric: formData.get("metric") || undefined,
        comparator: formData.get("comparator") || undefined,
        threshold: formData.get("threshold")
            ? Number(formData.get("threshold"))
            : undefined,
        cooldownSec: formData.get("cooldownSec")
            ? Number(formData.get("cooldownSec"))
            : undefined,
        isActive: formData.get("isActive") === "true" ? true : undefined,
    }

    const parsed = webhookUpdateSchema.safeParse(payload)
    if (!parsed.success) {
        return {success: false, message: t('webhook.update.invalidPayload')}
    }

    const terrarium = await requireTerrariumForOwner(terrariumId, ownerId)
    const webhook = await WebhookModel.findOneAndUpdate(
        {_id: webhookId, terrariumId: terrarium._id},
        {$set: parsed.data},
        {new: true}
    )

    if (!webhook) {
        return {success: false, message: t('webhook.common.notFound')}
    }

    revalidatePath(`/dashboard/terrariums/${terrariumId}/webhooks`)

    return {success: true, message: t('webhook.update.success'), data: webhook.toObject()}
}

export async function deleteWebhookAction(
    terrariumId: string,
    webhookId: string
): Promise<ActionResult> {
    const ownerId = await requireAuth()
    await connectMongoose()
    await ensureDbIndexes()
    const t = await getActionsTranslator();

    const terrarium = await requireTerrariumForOwner(terrariumId, ownerId)
    await WebhookModel.deleteOne({_id: webhookId, terrariumId: terrarium._id})

    revalidatePath(`/dashboard/terrariums/${terrariumId}/webhooks`)

    return {success: true, message: t('webhook.delete.success')}
}

export async function testWebhookAction(
    terrariumId: string,
    webhookId: string
): Promise<ActionResult> {
    const ownerId = await requireAuth()
    await connectMongoose()
    await ensureDbIndexes()
    const t = await getActionsTranslator();

    const terrarium = await requireTerrariumForOwner(terrariumId, ownerId)
    const webhook = await WebhookModel.findOne({
        _id: webhookId,
        terrariumId: terrarium._id,
    })

    if (!webhook) {
        return {success: false, message: t('webhook.common.notFound')}
    }

    const payload = {
        terrariumId: terrarium._id.toString(),
        metric: webhook.metric,
        comparator: webhook.comparator,
        threshold: webhook.threshold,
        current: webhook.threshold,
        at: new Date().toISOString(),
        samplesCountInBatch: 0,
    }

    await sendWebhookWithRetry(
        webhook.url,
        payload,
        {
            terrariumId: terrarium._id.toString(),
            metric: webhook.metric,
            signatureSecret: process.env.WEBHOOK_SIGNATURE_SECRET || "test",
            secretId: webhook.secretId ?? undefined,
        },
        1
    )

    return {success: true, message: t('webhook.test.success')}
}
