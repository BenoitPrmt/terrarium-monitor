import {z} from "zod"

import {
    TERRARIUM_LOCATION_VALUES,
    type TerrariumLocationValue,
} from "@/constants/terrarium-locations"

export const terrariumBaseSchema = z.object({
    name: z.string().min(2).max(120),
    location: z.enum(TERRARIUM_LOCATION_VALUES as [TerrariumLocationValue, ...TerrariumLocationValue[]]).optional(),
    description: z.string().max(2000).optional(),
})

export const terrariumCreateSchema = terrariumBaseSchema

export const terrariumUpdateSchema = terrariumBaseSchema
    .extend({
        regenerateToken: z.boolean().optional(),
    })
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        "At least one field must be provided"
    )

export const terrariumTokenRotateSchema = z.object({
    terrariumId: z.string(),
})

export type TerrariumCreateInput = z.infer<typeof terrariumCreateSchema>
export type TerrariumUpdateInput = z.infer<typeof terrariumUpdateSchema>
