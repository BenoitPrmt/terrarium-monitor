import type {
    AggregateGranularity,
    MetricType,
} from "@/models/constants"
import type {
    GranularityDataset,
    HourOfDayPoint,
    MetricDisplayConfig,
    MetricSeriesData,
    SeriesPoint,
} from "@/types/metrics"

export function buildSeriesByMetricAndGranularity(
    configs: MetricDisplayConfig[],
    granularityDatasets: GranularityDataset[]
): MetricSeriesData {
    return configs.reduce<MetricSeriesData>((acc, config, metricIndex) => {
        acc[config.key] = granularityDatasets.reduce<
            Record<AggregateGranularity, SeriesPoint[]>
        >((granAcc, granularityDataset) => {
            const dataset = granularityDataset.datasets[metricIndex] ?? []
            granAcc[granularityDataset.granularity] = dataset
                .map(normalizeAggregateEntry)
                .filter((entry): entry is SeriesPoint => entry !== null)
                .sort((a, b) => (a.bucket < b.bucket ? -1 : 1))
            return granAcc
        }, {} as Record<AggregateGranularity, SeriesPoint[]>)
        return acc
    }, {} as MetricSeriesData)
}

function normalizeAggregateEntry(entry: Record<string, any>): SeriesPoint | null {
    const bucket = entry.ts ?? entry.hour ?? entry.day
    const value =
        typeof entry.value === "number"
            ? entry.value
            : typeof entry.avg === "number"
                ? entry.avg
                : null

    if (!bucket || value === null || Number.isNaN(value)) {
        return null
    }

    return {bucket, value}
}

type HourOfDayAggregateEntry = {
    hourOfDay: number
    avg: number
}

export function buildHourOfDaySeries(
    configs: MetricDisplayConfig[],
    datasets: Array<Array<HourOfDayAggregateEntry>>
) {
    return configs.reduce<Record<MetricType, HourOfDayPoint[]>>(
        (acc, config, index) => {
            const dataset = datasets[index] ?? []
            acc[config.key] = dataset.map((entry) => ({
                hourOfDay: entry.hourOfDay,
                value: entry.avg,
            }))
            return acc
        },
        {} as Record<MetricType, HourOfDayPoint[]>
    )
}
