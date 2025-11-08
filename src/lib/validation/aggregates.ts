import {z} from "zod"

import {
    AGGREGATE_GRANULARITIES,
    METRIC_TYPES,
} from "@/models/constants"

export const aggregatesQuerySchema = z
    .object({
        type: z.enum(METRIC_TYPES),
        granularity: z.enum(AGGREGATE_GRANULARITIES).default("hourly"),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.number().int().min(1).max(1000).optional(),
    })
    .refine((data) => {
        if (data.from && data.to) {
            return new Date(data.from) <= new Date(data.to)
        }
        return true
    }, "from must be before to")

export type AggregatesQueryInput = z.infer<typeof aggregatesQuerySchema>
