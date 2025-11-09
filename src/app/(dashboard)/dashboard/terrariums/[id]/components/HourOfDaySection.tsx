import {HourOfDayChart} from "@/components/terrariums/HourOfDayChart"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type {MetricType} from "@/models/constants"
import type {HourOfDayPoint, MetricDisplayConfig} from "@/types/metrics"

type HourOfDaySectionProps = {
    datasets: Record<MetricType, HourOfDayPoint[]>
    configs: MetricDisplayConfig[]
    initialMetric: MetricType
}

export function HourOfDaySection({
    datasets,
    configs,
    initialMetric,
}: HourOfDaySectionProps) {
    const metricOptions = configs.map((config) => ({
        value: config.key,
        label: config.label,
        color: config.color,
    }))

    return (
        <Card>
            <CardHeader className="space-y-2">
                <CardTitle>Analyse par heure de la journée</CardTitle>
                <CardDescription>
                    Identifiez les heures typiques de pics ou creux pour chaque métrique.
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
