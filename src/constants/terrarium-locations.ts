export const TERRARIUM_LOCATIONS = [
    { value: "living_room", label: "Salon" },
    { value: "bedroom", label: "Chambre" },
    { value: "kitchen", label: "Cuisine" },
    { value: "bathroom", label: "Salle de bain" },
    { value: "dining_room", label: "Salle à manger" },
    { value: "garden", label: "Jardin" },
    { value: "balcony", label: "Balcon" },
    { value: "office", label: "Bureau" },
    { value: "toilet", label: "Toilettes" },
    { value: "other", label: "Autre" },
] as const

export type TerrariumLocationValue = typeof TERRARIUM_LOCATIONS[number]["value"]

export const TERRARIUM_LOCATION_VALUES: TerrariumLocationValue[] = TERRARIUM_LOCATIONS.map(
    (item) => item.value
)

export const TERRARIUM_LOCATION_LABELS: Record<TerrariumLocationValue, string> =
    TERRARIUM_LOCATIONS.reduce(
        (acc, item) => ({ ...acc, [item.value]: item.label }),
        {} as Record<TerrariumLocationValue, string>
    )
