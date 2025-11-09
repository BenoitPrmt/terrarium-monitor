import {
    BedDouble,
    Briefcase,
    Building,
    CookingPot,
    MoreHorizontal,
    ShowerHead,
    Sofa,
    Trees,
    Toilet,
    Utensils,
} from "lucide-react"
import type {LucideIcon} from "lucide-react"

import {
    TERRARIUM_LOCATIONS,
    type TerrariumLocationValue,
} from "@/constants/terrarium-locations"

const ICON_MAP: Record<TerrariumLocationValue, LucideIcon> = {
    living_room: Sofa,
    bedroom: BedDouble,
    kitchen: CookingPot,
    bathroom: ShowerHead,
    dining_room: Utensils,
    garden: Trees,
    balcony: Building,
    office: Briefcase,
    toilet: Toilet,
    other: MoreHorizontal,
}

export function getLocationIcon(value: TerrariumLocationValue): LucideIcon {
    return ICON_MAP[value] ?? MoreHorizontal
}

export const TERRARIUM_LOCATION_OPTIONS = TERRARIUM_LOCATIONS.map((option) => ({
    ...option,
    icon: ICON_MAP[option.value],
}))
