import {z} from "zod"

import {
    TERRARIUM_ACTION_TYPES,
    type TerrariumActionType,
} from "@/constants/terrarium-actions"

type ActionTuple = [TerrariumActionType, ...TerrariumActionType[]]

const TERRARIUM_ACTION_TYPES_TUPLE = [...TERRARIUM_ACTION_TYPES] as ActionTuple

export const terrariumActionCreateSchema = z.object({
    type: z.enum(
        TERRARIUM_ACTION_TYPES_TUPLE
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
