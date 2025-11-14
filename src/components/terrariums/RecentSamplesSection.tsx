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
import {getLocale, getTranslations} from "next-intl/server";

type RecentSamplesSectionProps = {
    samples: RecentSample[]
    configMap: Record<MetricType, MetricDisplayConfig>
}

export async function RecentSamplesSection({samples, configMap}: RecentSamplesSectionProps) {
    const t = await getTranslations('Terrariums.samples');
    const metricsT = await getTranslations('Common.metrics');
    const locale = await getLocale();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('headers.type')}</TableHead>
                            <TableHead>{t('headers.value')}</TableHead>
                            <TableHead>{t('headers.timestamp')}</TableHead>
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
                                                <span>{metricsT(config.labelKey)}</span>
                                            </div>
                                        ) : (
                                            sample.type
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {sample.value.toFixed(2)} {sample.unit}
                                    </TableCell>
                                    <TableCell>
                                        {timeAgoInWords(new Date(sample.ts), {locale})}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {samples.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    {t('empty')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
