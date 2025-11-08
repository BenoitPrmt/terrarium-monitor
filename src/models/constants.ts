export const METRIC_TYPES = ["TEMPERATURE", "HUMIDITY", "PRESSURE", "ALTITUDE"] as const
export type MetricType = (typeof METRIC_TYPES)[number]

export const SAMPLE_UNITS = ["C", "%", "hPa", "m"] as const
export type SampleUnit = (typeof SAMPLE_UNITS)[number]

export const METRIC_UNIT_MAP: Record<MetricType, SampleUnit> = {
    TEMPERATURE: "C",
    HUMIDITY: "%",
    PRESSURE: "hPa",
    ALTITUDE: "m",
}

export const WEBHOOK_COMPARATORS = ["gt", "gte", "lt", "lte"] as const
export type WebhookComparator = (typeof WEBHOOK_COMPARATORS)[number]

export const AGGREGATE_GRANULARITIES = ["raw", "hourly", "daily", "byHourOfDay"] as const
export type AggregateGranularity = (typeof AGGREGATE_GRANULARITIES)[number]
