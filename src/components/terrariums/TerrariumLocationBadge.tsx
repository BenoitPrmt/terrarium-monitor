import {Badge} from "@/components/ui/badge"
import {
    TERRARIUM_LOCATION_LABELS,
    type TerrariumLocationValue,
} from "@/constants/terrarium-locations"
import {getLocationIcon} from "@/components/terrariums/locationIcons"

type Props = {
    value?: string | null
}

export function TerrariumLocationBadge({value}: Props) {
    const locationValue = (value as TerrariumLocationValue) || "other"
    const label = TERRARIUM_LOCATION_LABELS[locationValue] ?? TERRARIUM_LOCATION_LABELS.other
    const Icon = getLocationIcon(locationValue)

    return (
        <Badge variant="secondary" className="flex items-center gap-1">
            <Icon className="size-3.5"/>
            {label}
        </Badge>
    )
}
