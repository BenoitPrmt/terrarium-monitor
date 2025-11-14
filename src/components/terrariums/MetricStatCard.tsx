import type {LucideIcon} from "lucide-react"
import {InfoIcon} from "lucide-react"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip"
import type {MetricSnapshot} from "@/lib/services/metrics"
import {cn, timeAgoInWords} from "@/lib/utils"
import {getLocale, getTranslations} from "next-intl/server";

type MetricStatCardProps = {
    label: string
    unitLabel: string
    icon: LucideIcon
    accentClassName?: string
    snapshot?: MetricSnapshot
    locale: string
}

export async function MetricStatCard({
    label,
    unitLabel,
    icon: Icon,
    accentClassName,
    snapshot,
    locale,
}: MetricStatCardProps) {
    const t = await getTranslations('Terrariums.metrics');
    const common = await getTranslations('Common');
    const resolvedLocale = locale || (await getLocale());
    const latestValue =
        typeof snapshot?.latestValue === "number" ? snapshot.latestValue : null
    const lastUpdatedAt = snapshot?.lastUpdatedAt
        ? new Date(snapshot.lastUpdatedAt)
        : null
    const changeValue =
        typeof snapshot?.changeOver24h === "number"
            ? snapshot.changeOver24h
            : null

    const formattedValue =
        latestValue !== null ? `${latestValue.toFixed(1)} ${unitLabel}` : "—"

    const changeDisplay =
        changeValue !== null
            ? `${changeValue > 0 ? "+" : ""}${changeValue.toFixed(1)} ${unitLabel}`
            : null

    const changeClassName =
        changeValue === null
            ? "text-muted-foreground"
            : changeValue > 0
              ? "text-emerald-600"
              : changeValue < 0
                ? "text-red-500"
                : "text-muted-foreground"

    const tooltipLabel = lastUpdatedAt
        ? new Intl.DateTimeFormat(resolvedLocale, {
              dateStyle: "long",
              timeStyle: "short",
          }).format(lastUpdatedAt)
        : common('status.notAvailable')

    return (
        <Card>
            <CardHeader className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                            {label}
                            {lastUpdatedAt && (
                                <Tooltip>
                                    <TooltipTrigger asChild className="cursor-help">
                                        <button
                                            type="button"
                                            className="text-muted-foreground transition-colors hover:text-foreground"
                                            aria-label={t('ariaLastUpdated', {date: tooltipLabel})}
                                        >
                                            <InfoIcon className="size-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {t('tooltip', {date: tooltipLabel})}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {lastUpdatedAt
                                ? t('updatedAgo', {value: timeAgoInWords(lastUpdatedAt, {locale: resolvedLocale})})
                                : t('noRecentData')}
                        </p>
                    </div>
                    <div
                        className={cn(
                            "rounded-full border bg-muted p-2 text-muted-foreground",
                            accentClassName
                        )}
                    >
                        <Icon className="size-5" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-3xl font-semibold tracking-tight">
                    {formattedValue}
                </p>
                <p className={cn("text-sm font-medium", changeClassName)}>
                    {changeDisplay
                        ? t('changeWindow', {value: changeDisplay})
                        : t('noChange')}
                </p>
            </CardContent>
        </Card>
    )
}
