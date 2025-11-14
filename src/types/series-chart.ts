import type {AggregateGranularity, MetricType} from "@/models/constants";

export type MetricOption = {
    value: MetricType
    label: string
    color: string
}

export type GranularityOption = {
    value: AggregateGranularity
    labelKey: string
}

export type RangeOption = {
    value: string
    labelKey: string
}
