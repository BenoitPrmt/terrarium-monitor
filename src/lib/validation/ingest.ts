import {z} from "zod"

import {
    METRIC_TYPES,
    METRIC_UNIT_MAP,
    SAMPLE_UNITS,
} from "@/models/constants"

const metricEnum = z.enum(METRIC_TYPES)
const unitEnum = z.enum(SAMPLE_UNITS)

export const ingestSampleSchema = z
    .object({
        t: z.number().int(),
        type: metricEnum,
        value: z.number().finite(),
        unit: unitEnum,
    })
    .superRefine((sample, ctx) => {
        const expectedUnit = METRIC_UNIT_MAP[sample.type]
        if (sample.unit !== expectedUnit) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Unit must be ${expectedUnit} for ${sample.type}`,
                path: ["unit"],
            })
        }
    })

export const ingestPayloadSchema = z.object({
    device_id: z.string().max(64).optional(),
    sent_at: z.number().int().optional(),
    samples: z.array(ingestSampleSchema).min(1).max(200),
})

export type IngestPayload = z.infer<typeof ingestPayloadSchema>
export type IngestSample = z.infer<typeof ingestSampleSchema>
