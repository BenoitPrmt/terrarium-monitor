import {MetricSeriesChart} from "@/components/terrariums/charts/MetricSeriesChart"
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
import {getTranslations} from "next-intl/server";

type MetricSeriesSectionProps = {
    metricSeriesData: MetricSeriesData
    configs: MetricDisplayConfig[]
    granularityOptions: ChartGranularityOption[]
    rangeOptions: ChartRangeOption[]
    initialMetric: MetricType
    initialGranularity: AggregateGranularity
    initialRange: string
}

export async function MetricSeriesSection({
    metricSeriesData,
    configs,
    granularityOptions,
    rangeOptions,
    initialMetric,
    initialGranularity,
    initialRange,
}: MetricSeriesSectionProps) {
    const metricsT = await getTranslations('Common.metrics');
    const sectionT = await getTranslations('Terrariums.series');
    const metricOptions = configs.map((config) => ({
        value: config.key,
        label: `${metricsT(config.labelKey)} (${config.unitLabel})`,
        color: config.color,
    }))

    return (
        <Card>
            <CardHeader className="space-y-4">
                <div>
                    <CardTitle>{sectionT('title')}</CardTitle>
                    <CardDescription>
                        {sectionT('description')}
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
