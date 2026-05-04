import {z} from "zod"

import {
    DEFAULT_DISCORD_BODY_CONFIG,
    isValidCustomWebhookTemplate,
    WEBHOOK_BODY_PRESETS,
} from "@/lib/utils/webhook-payload"
import {METRIC_TYPES, WEBHOOK_COMPARATORS} from "@/models/constants"

const discordBodyConfigSchema = z.object({
    content: z.string().trim().min(1).max(1000),
    embedTitle: z.string().trim().min(1).max(256),
    embedDescription: z.string().trim().min(1).max(2000),
    embedColor: z
        .string()
        .trim()
        .regex(/^#[0-9a-fA-F]{6}$/),
    fields: z
        .array(
            z.object({
                name: z.string().trim().min(1).max(256),
                value: z.string().trim().min(1).max(1024),
                inline: z.boolean().default(true),
            })
        )
        .min(1)
        .max(5),
})

const webhookFields = {
    name: z.string().min(2).max(120),
    url: z.string().url(),
    metric: z.enum(METRIC_TYPES),
    comparator: z.enum(WEBHOOK_COMPARATORS),
    threshold: z.number().finite(),
    cooldownSec: z.number().int().min(60).max(86400),
    isActive: z.boolean().optional(),
    bodyPreset: z.enum(WEBHOOK_BODY_PRESETS),
    discordBodyConfig: discordBodyConfigSchema
        .default(DEFAULT_DISCORD_BODY_CONFIG)
        .optional(),
    customBodyTemplate: z.string().trim().max(5000).optional(),
    secretId: z.string().max(64).optional(),
}

export const webhookCreateSchema = z
    .object({
        ...webhookFields,
        cooldownSec: webhookFields.cooldownSec.default(900),
        bodyPreset: webhookFields.bodyPreset.default("default"),
    })
    .superRefine(validateCustomBodyTemplate)

export const webhookUpdateSchema = z
    .object(webhookFields)
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    })
    .superRefine(validateCustomBodyTemplate)

function validateCustomBodyTemplate(
    data: {
        bodyPreset?: string
        customBodyTemplate?: string
    },
    ctx: z.RefinementCtx
) {
    if (data.bodyPreset !== "custom") {
        return
    }

    if (!data.customBodyTemplate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A custom body template is required",
            path: ["customBodyTemplate"],
        })
        return
    }

    if (!isValidCustomWebhookTemplate(data.customBodyTemplate)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Custom body template must be a valid JSON object",
            path: ["customBodyTemplate"],
        })
    }
}

export type WebhookCreateInput = z.infer<typeof webhookCreateSchema>
export type WebhookUpdateInput = z.infer<typeof webhookUpdateSchema>
