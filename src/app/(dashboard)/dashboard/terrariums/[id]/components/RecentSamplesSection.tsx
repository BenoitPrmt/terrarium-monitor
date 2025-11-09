import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {timeAgoInWords} from "@/lib/utils"
import type {MetricType} from "@/models/constants"
import type {
    MetricDisplayConfig,
    RecentSample,
} from "@/types/metrics"

type RecentSamplesSectionProps = {
    samples: RecentSample[]
    configMap: Record<MetricType, MetricDisplayConfig>
}

export function RecentSamplesSection({samples, configMap}: RecentSamplesSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Mesures récentes</CardTitle>
                <CardDescription>20 derniers échantillons ingérés.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Valeur</TableHead>
                            <TableHead>Horodatage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {samples.map((sample) => {
                            const config = configMap[sample.type]
                            const Icon = config?.icon

                            return (
                                <TableRow key={sample._id.toString()}>
                                    <TableCell>
                                        {config && Icon ? (
                                            <div className="flex items-center gap-2">
                                                <Icon className="size-4 text-muted-foreground"/>
                                                <span>{config.label}</span>
                                            </div>
                                        ) : (
                                            sample.type
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {sample.value.toFixed(2)} {sample.unit}
                                    </TableCell>
                                    <TableCell>
                                        {timeAgoInWords(new Date(sample.ts))}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {samples.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Pas encore de données.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
