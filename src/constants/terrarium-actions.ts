import type {LucideIcon} from "lucide-react"
import {
    Droplets,
    Leaf,
    Sparkles,
    Wrench,
} from "lucide-react"

export const TERRARIUM_ACTION_TYPES = [
    "WATERING",
    "FEEDING",
    "CLEANING",
    "MAINTENANCE",
    "OTHER",
] as const

export type TerrariumActionType = (typeof TERRARIUM_ACTION_TYPES)[number]

export const TERRARIUM_ACTION_LABEL_KEYS: Record<TerrariumActionType, string> = {
    WATERING: "watering",
    FEEDING: "feeding",
    CLEANING: "cleaning",
    MAINTENANCE: "maintenance",
    OTHER: "other",
}

type ActionVisualConfig = {
    icon: LucideIcon
    accentClassName: string
}

export const TERRARIUM_ACTION_VISUALS: Record<
    TerrariumActionType,
    ActionVisualConfig
> = {
    WATERING: {
        icon: Droplets,
        accentClassName: "border-sky-200/70 bg-sky-50 text-sky-600 dark:text-sky-400",
    },
    FEEDING: {
        icon: Leaf,
        accentClassName: "border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:text-emerald-400",
    },
    CLEANING: {
        icon: Sparkles,
        accentClassName: "border-amber-200/70 bg-amber-50 text-amber-600 dark:text-amber-400",
    },
    MAINTENANCE: {
        icon: Wrench,
        accentClassName: "border-purple-200/70 bg-purple-50 text-purple-600 dark:text-purple-400",
    },
    OTHER: {
        icon: Sparkles,
        accentClassName: "border-slate-200/70 bg-slate-50 text-slate-600 dark:text-slate-300",
    },
}

export const TERRARIUM_ACTION_OPTIONS = TERRARIUM_ACTION_TYPES.map(
    (type) => ({
        value: type,
        labelKey: TERRARIUM_ACTION_LABEL_KEYS[type],
    })
)
