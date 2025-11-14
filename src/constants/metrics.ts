import {
    Droplets,
    Gauge,
    Mountain,
    Thermometer,
} from "lucide-react"

import type {AggregateGranularity, MetricType} from "@/models/constants"
import type {
    ChartGranularityOption,
    ChartRangeOption,
    MetricDisplayConfig,
} from "@/types/metrics"

export const METRIC_DISPLAY_CONFIGS: MetricDisplayConfig[] = [
    {
        key: "TEMPERATURE",
        label: "Température",
        unitLabel: "°C",
        color: "#f97316",
        icon: Thermometer,
        accentClassName: "border-amber-200/70 bg-amber-50 text-amber-600",
    },
    {
        key: "HUMIDITY",
        label: "Humidité",
        unitLabel: "%",
        color: "#0ea5e9",
        icon: Droplets,
        accentClassName: "border-sky-200/70 bg-sky-50 text-sky-600",
    },
    {
        key: "PRESSURE",
        label: "Pression",
        unitLabel: "hPa",
        color: "#8b5cf6",
        icon: Gauge,
        accentClassName: "border-violet-200/70 bg-violet-50 text-violet-600",
    },
    {
        key: "ALTITUDE",
        label: "Altitude",
        unitLabel: "m",
        color: "#059669",
        icon: Mountain,
        accentClassName: "border-emerald-200/70 bg-emerald-50 text-emerald-600",
    },
]

export const METRIC_DISPLAY_CONFIG_MAP: Record<
    MetricType,
    MetricDisplayConfig
> = METRIC_DISPLAY_CONFIGS.reduce(
    (acc, config) => {
        acc[config.key] = config
        return acc
    },
    {} as Record<MetricType, MetricDisplayConfig>
)

export const DEFAULT_METRIC_KEY: MetricType =
    METRIC_DISPLAY_CONFIGS[0]?.key ?? "TEMPERATURE"

export const DEFAULT_SECONDARY_METRIC_KEY: MetricType =
    METRIC_DISPLAY_CONFIGS[1]?.key ?? DEFAULT_METRIC_KEY

export const METRIC_RANGE_MAP: Record<string, number> = {
    "24h": 24,
    "7d": 24 * 7,
    "30d": 24 * 30,
}

export const CHART_GRANULARITIES: AggregateGranularity[] = [
    "raw",
    "hourly",
    "daily",
]

export const CHART_GRANULARITY_OPTIONS: ChartGranularityOption[] = [
    {value: "raw", label: "Points bruts"},
    {value: "hourly", label: "Agrégation horaire"},
    {value: "daily", label: "Agrégation journalière"},
]

export const CHART_RANGE_OPTIONS: ChartRangeOption[] = [
    {value: "24h", label: "Dernières 24h"},
    {value: "7d", label: "7 jours"},
    {value: "30d", label: "30 jours"},
]

export const CHART_Y_AXIS_DELTA = 0.05;