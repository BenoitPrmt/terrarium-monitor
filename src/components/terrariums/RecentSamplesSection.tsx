import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
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

type SampleGroup = {
    key: string
    sentAt: Date
    samples: RecentSample[]
}

export async function RecentSamplesSection({samples, configMap}: RecentSamplesSectionProps) {
    const t = await getTranslations('Terrariums.samples');
    const metricsT = await getTranslations('Common.metrics');
    const locale = await getLocale();
    const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "medium",
    })

    const groupedSamples = samples.reduce<Map<string, SampleGroup>>((acc, sample) => {
        const sentAtValue = sample.sentAt ? new Date(sample.sentAt) : new Date(sample.ts)
        const key = sentAtValue.toISOString()
        const existing = acc.get(key)

        if (existing) {
            existing.samples.push(sample)
            return acc
        }

        acc.set(key, {
            key,
            sentAt: sentAtValue,
            samples: [sample],
        })
        return acc
    }, new Map<string, SampleGroup>())

    const sampleGroups = Array.from(groupedSamples.values())
        .map((group) => ({
            ...group,
            samples: group.samples.toSorted(
                (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
            ),
        }))
        .toSorted((a, b) => b.sentAt.getTime() - a.sentAt.getTime())

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {sampleGroups.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        {t('empty')}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sampleGroups.map((group) => {
                            const formattedSentAt = dateTimeFormatter.format(group.sentAt)
                            const sentAtRelative = timeAgoInWords(group.sentAt, {locale})

                            if (group.samples.length === 1) {
                                const sample = group.samples[0]
                                const config = configMap[sample.type]
                                const Icon = config?.icon

                                return (
                                    <div key={group.key} className="rounded-lg border px-4 py-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{formattedSentAt}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t('sentAtLabel', {value: sentAtRelative})}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 text-sm sm:items-end">
                                                <div className="flex items-center gap-2">
                                                    {config && Icon ? (
                                                        <>
                                                            <Icon className="size-4 text-muted-foreground"/>
                                                            <span>{metricsT(config.labelKey)}</span>
                                                        </>
                                                    ) : (
                                                        <span>{sample.type}</span>
                                                    )}
                                                </div>
                                                <div className="font-medium">
                                                    {sample.value.toFixed(2)} {sample.unit}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <Accordion
                                    key={group.key}
                                    type="single"
                                    collapsible
                                    className="rounded-lg border px-4"
                                >
                                    <AccordionItem value={group.key} className="border-b-0">
                                        <AccordionTrigger className="py-3 hover:no-underline">
                                            <div className="flex flex-1 flex-col gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                                <div>
                                                    <p className="text-sm font-medium">{formattedSentAt}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('sentAtLabel', {value: sentAtRelative})}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {t('groupCount', {count: group.samples.length})}
                                                </p>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-3">
                                            <Table>
                                                <TableBody>
                                                    {group.samples.map((sample) => {
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
                                                                <TableCell className="text-right text-muted-foreground">
                                                                    {timeAgoInWords(new Date(sample.ts), {locale})}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
