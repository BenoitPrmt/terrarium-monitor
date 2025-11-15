export const TERRARIUM_LOCATIONS = [
    {value: "living_room", labelKey: "living_room"},
    {value: "bedroom", labelKey: "bedroom"},
    {value: "kitchen", labelKey: "kitchen"},
    {value: "bathroom", labelKey: "bathroom"},
    {value: "dining_room", labelKey: "dining_room"},
    {value: "garden", labelKey: "garden"},
    {value: "balcony", labelKey: "balcony"},
    {value: "office", labelKey: "office"},
    {value: "toilet", labelKey: "toilet"},
    {value: "other", labelKey: "other"},
] as const

export type TerrariumLocationValue = typeof TERRARIUM_LOCATIONS[number]["value"]

export const TERRARIUM_LOCATION_VALUES: TerrariumLocationValue[] = TERRARIUM_LOCATIONS.map(
    (item) => item.value
)

export const TERRARIUM_LOCATION_LABELS: Record<TerrariumLocationValue, string> =
    TERRARIUM_LOCATIONS.reduce(
        (acc, item) => ({...acc, [item.value]: item.labelKey}),
        {} as Record<TerrariumLocationValue, string>
    )
