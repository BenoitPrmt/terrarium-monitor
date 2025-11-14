import type {AggregateGranularity, MetricType} from "@/models/constants";

export type MetricOption = {
    value: MetricType
    label: string
    color: string
}

export type GranularityOption = {
    value: AggregateGranularity
    label: string
}

export type RangeOption = {
    value: string
    label: string
}