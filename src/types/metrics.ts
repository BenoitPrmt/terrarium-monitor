import type {Types} from "mongoose"
import type {LucideIcon} from "lucide-react"

import type {AggregateGranularity, MetricType} from "@/models/constants"
import type {SampleDocument} from "@/models/Sample"

export type MetricDisplayConfig = {
    key: MetricType
    label: string
    unitLabel: string
    color: string
    icon: LucideIcon
    accentClassName: string
}

export type SeriesPoint = {
    bucket: string
    value: number
}

export type HourOfDayPoint = {
    hourOfDay: number
    value: number
}

export type GranularityDataset = {
    granularity: AggregateGranularity
    datasets: Array<Record<string, any>[]>
}

export type MetricSeriesData = Record<
    MetricType,
    Record<AggregateGranularity, SeriesPoint[]>
>

export type ChartGranularityOption = {
    value: AggregateGranularity
    label: string
}

export type ChartRangeOption = {
    value: string
    label: string
}

export type RecentSample = SampleDocument & {
    _id: Types.ObjectId
}
