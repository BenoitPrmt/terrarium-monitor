import type {TerrariumActionType} from "@/constants/terrarium-actions"

export type TerrariumSummary = {
    id: string
    ownerId: string
    name: string
    location: string
    description?: string | null
    uuid: string
    createdAt?: string | null
    updatedAt?: string | null
}

export type TerrariumActionEntry = {
    id: string
    terrariumId: string
    type: TerrariumActionType
    notes: string
    performedAt: string
    createdAt: string
}
