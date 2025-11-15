import {HourOfDayChart} from "@/components/terrariums/charts/HourOfDayChart"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type {MetricType} from "@/models/constants"
import type {HourOfDayPoint, MetricDisplayConfig} from "@/types/metrics"
import {getTranslations} from "next-intl/server";

type HourOfDaySectionProps = {
    datasets: Record<MetricType, HourOfDayPoint[]>
    configs: MetricDisplayConfig[]
    initialMetric: MetricType
}

export async function HourOfDaySection({
    datasets,
    configs,
    initialMetric,
}: HourOfDaySectionProps) {
    const metricsT = await getTranslations('Common.metrics');
    const sectionT = await getTranslations('Terrariums.hourOfDay');
    const metricOptions = configs.map((config) => ({
        value: config.key,
        label: metricsT(config.labelKey),
        color: config.color,
        unitLabel: config.unitLabel,
    }))

    return (
        <Card>
            <CardHeader className="space-y-2">
                <CardTitle>{sectionT('title')}</CardTitle>
                <CardDescription>
                    {sectionT('description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <HourOfDayChart
                    datasets={datasets}
                    metricOptions={metricOptions}
                    initialMetric={initialMetric}
                />
            </CardContent>
        </Card>
    )
}
