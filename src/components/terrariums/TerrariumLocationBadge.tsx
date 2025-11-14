import {Badge} from "@/components/ui/badge"
import {
    TERRARIUM_LOCATION_LABELS,
    type TerrariumLocationValue,
} from "@/constants/terrarium-locations"
import {getLocationIcon} from "@/components/terrariums/locationIcons"
import {getTranslations} from "next-intl/server";

type Props = {
    value?: string | null;
    variant?: "default" | "secondary" | "outline";
}

export async function TerrariumLocationBadge({ value, variant = "secondary" }: Props) {
    const locationValue = (value as TerrariumLocationValue) || "other"
    const labelKey = TERRARIUM_LOCATION_LABELS[locationValue] ?? TERRARIUM_LOCATION_LABELS.other
    const Icon = getLocationIcon(locationValue)
    const t = await getTranslations('Common.locations');

    return (
        <Badge variant={variant} className="flex items-center gap-1">
            <Icon className="size-3.5"/>
            {t(labelKey)}
        </Badge>
    )
}
