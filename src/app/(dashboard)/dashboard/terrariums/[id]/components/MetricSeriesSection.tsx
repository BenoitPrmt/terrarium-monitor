import {MetricSeriesChart} from "@/components/terrariums/MetricSeriesChart"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type {AggregateGranularity, MetricType} from "@/models/constants"
import type {
    ChartGranularityOption,
    ChartRangeOption,
    MetricDisplayConfig,
    MetricSeriesData,
} from "@/types/metrics"

type MetricSeriesSectionProps = {
    metricSeriesData: MetricSeriesData
    configs: MetricDisplayConfig[]
    granularityOptions: ChartGranularityOption[]
    rangeOptions: ChartRangeOption[]
    initialMetric: MetricType
    initialGranularity: AggregateGranularity
    initialRange: string
}

export function MetricSeriesSection({
    metricSeriesData,
    configs,
    granularityOptions,
    rangeOptions,
    initialMetric,
    initialGranularity,
    initialRange,
}: MetricSeriesSectionProps) {
    const metricOptions = configs.map((config) => ({
        value: config.key,
        label: `${config.label} (${config.unitLabel})`,
        color: config.color,
    }))

    return (
        <Card>
            <CardHeader className="space-y-4">
                <div>
                    <CardTitle>Séries temporelles</CardTitle>
                    <CardDescription>
                        Analysez chaque métrique sur l’intervalle sélectionné.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <MetricSeriesChart
                    dataByMetric={metricSeriesData}
                    metricOptions={metricOptions}
                    granularityOptions={granularityOptions}
                    rangeOptions={rangeOptions}
                    initialMetric={initialMetric}
                    initialGranularity={initialGranularity}
                    initialRange={initialRange}
                />
            </CardContent>
        </Card>
    )
}
