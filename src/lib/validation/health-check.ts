import {z} from "zod"

const MIN_DELAY_MINUTES = 5
const MAX_DELAY_MINUTES = 24 * 60

export const healthCheckUpdateSchema = z
    .object({
        url: z
            .string()
            .trim()
            .url()
            .max(500, "URL is too long")
            .optional(),
        delayMinutes: z
            .number()
            .int()
            .min(MIN_DELAY_MINUTES)
            .max(MAX_DELAY_MINUTES)
            .optional(),
        isEnabled: z.boolean(),
    })
    .superRefine((data, ctx) => {
        if (data.isEnabled) {
            if (!data.url) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "URL is required when health check is enabled",
                    path: ["url"],
                })
            }
            if (
                data.delayMinutes === undefined ||
                data.delayMinutes === null
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Delay is required when health check is enabled",
                    path: ["delayMinutes"],
                })
            }
        }
    })

export type HealthCheckUpdateInput = z.infer<typeof healthCheckUpdateSchema>
