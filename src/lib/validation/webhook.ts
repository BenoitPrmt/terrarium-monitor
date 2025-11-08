import {z} from "zod"

import {METRIC_TYPES, WEBHOOK_COMPARATORS} from "@/models/constants"

const baseWebhookSchema = z.object({
    name: z.string().min(2).max(120),
    url: z.string().url(),
    metric: z.enum(METRIC_TYPES),
    comparator: z.enum(WEBHOOK_COMPARATORS),
    threshold: z.number().finite(),
    cooldownSec: z.number().int().min(60).max(86400).default(900),
    isActive: z.boolean().optional(),
    secretId: z.string().max(64).optional(),
})

export const webhookCreateSchema = baseWebhookSchema
export const webhookUpdateSchema = baseWebhookSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
)

export type WebhookCreateInput = z.infer<typeof webhookCreateSchema>
export type WebhookUpdateInput = z.infer<typeof webhookUpdateSchema>
