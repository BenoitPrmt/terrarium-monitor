import {z} from "zod"

import {
    TERRARIUM_ACTION_TYPES,
    type TerrariumActionType,
} from "@/constants/terrarium-actions"

export const terrariumActionCreateSchema = z.object({
    type: z.enum(
        TERRARIUM_ACTION_TYPES as [
            TerrariumActionType,
            ...TerrariumActionType[]
        ]
    ),
    notes: z
        .string()
        .trim()
        .min(3, "Veuillez décrire l'action.")
        .max(500, "La description est trop longue."),
})

export type TerrariumActionCreateInput = z.infer<
    typeof terrariumActionCreateSchema
>
