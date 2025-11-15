"use client"

import {useEffect, useId, useMemo, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {ButtonGroup} from "@/components/ui/button-group";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type {AggregateGranularity, MetricType} from "@/models/constants";
import {CHART_Y_AXIS_DELTA, METRIC_RANGE_MAP} from "@/constants/metrics";
import {expand} from "@/lib/metrics/series";
import {GranularityOption, MetricOption, RangeOption} from "@/types/series-chart";
import {SeriesPoint} from "@/types/metrics";
import {useTranslations, useLocale} from "next-intl";

type Props = {
    dataByMetric: Record<
        MetricType,
        Record<AggregateGranularity, SeriesPoint[]>
    >
    metricOptions: MetricOption[]
    granularityOptions: GranularityOption[]
    rangeOptions: RangeOption[]
    initialMetric: MetricType
    initialGranularity: AggregateGranularity
    initialRange: string
    requestedAt: string
}

export function MetricSeriesChart({
                                       dataByMetric,
                                       metricOptions,
                                       granularityOptions,
                                       rangeOptions,
                                       initialMetric,
                                       initialGranularity,
                                       initialRange,
                                       requestedAt,
                                   }: Props) {
    const t = useTranslations('Terrariums.series');
    const rangeT = useTranslations('Dashboard.metrics.range');
    const granularityT = useTranslations('Dashboard.metrics.granularity');
    const locale = useLocale();
    const metricMap = useMemo(() => {
        return metricOptions.reduce<Record<MetricType, MetricOption>>(
            (acc, option) => {
                acc[option.value] = option
                return acc
            },
            {} as Record<MetricType, MetricOption>
        )
    }, [metricOptions])

    const [metric, setMetric] = useState<MetricType>(initialMetric)
    const [granularity, setGranularity] =
        useState<AggregateGranularity>(initialGranularity)
    const [range, setRange] = useState<string>(initialRange)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        setMetric(initialMetric)
    }, [initialMetric])
    useEffect(() => {
        setGranularity(initialGranularity)
    }, [initialGranularity])
    useEffect(() => {
        setRange(initialRange)
    }, [initialRange])

    const updateSearchParams = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams)
        let hasChanged = false
        Object.entries(updates).forEach(([key, value]) => {
            if (params.get(key) !== value) {
                params.set(key, value)
                hasChanged = true
            }
        })
        if (!hasChanged) {
            return
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleMetricChange = (value: string) => {
        const casted = value as MetricType
        setMetric(casted)
        updateSearchParams({metric: casted})
    }

    const handleGranularityChange = (value: string) => {
        const casted = value as AggregateGranularity
        setGranularity(casted)
        updateSearchParams({granularity: casted})
    }

    const handleRangeChange = (value: string) => {
        setRange(value)
        if (value !== "24h" && granularity === "raw") {
            setGranularity("hourly")
            updateSearchParams({range: value, granularity: "hourly"})
            return
        }
        updateSearchParams({range: value})
    }

    const gradientBaseId = useId().replace(/:/g, "")
    const selectedOption =
        metricMap[metric] ?? metricMap[metricOptions[0]?.value as MetricType]
    const requestTimestamp = useMemo(
        () => new Date(requestedAt).getTime(),
        [requestedAt]
    )
    const chartData = useMemo(() => {
        const dataset = dataByMetric[metric]?.[granularity] ?? []
        const rangeHours = METRIC_RANGE_MAP[range] ?? METRIC_RANGE_MAP["24h"]
        const cutoff =
            requestTimestamp - rangeHours * 60 * 60 * 1000
        return dataset.filter((point) => {
            const bucketTime = new Date(point.bucket).getTime()
            return bucketTime >= cutoff
        })
    }, [dataByMetric, granularity, metric, range, requestTimestamp])
    const color = selectedOption?.color ?? "#0ea5e9"
    const gradientId = `${gradientBaseId}-${metric}-fill`
    const yDomain = useMemo<[number, number]>(() => {
        const values = chartData
            .map((point) => point.value)
            .filter((value): value is number => Number.isFinite(value))

        if (values.length === 0) {
            return [0, 1]
        }

        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        if (minValue === maxValue) {
            const padding =
                minValue === 0 ? 1 : Math.abs(minValue) * CHART_Y_AXIS_DELTA;
            return [minValue - padding, maxValue + padding];
        }

        return [
            Math.floor(expand(minValue, "min")),
            Math.floor(expand(maxValue, "max"))
        ];
    }, [chartData])

    const chartConfig: ChartConfig = useMemo(
        () => ({
            value: {
                label: selectedOption?.label ?? t('valueLabel'),
                color,
            },
        }),
        [selectedOption, color]
    )

    const labelFormatter = useMemo(() => {
        const options: Intl.DateTimeFormatOptions =
            granularity === "daily"
                ? {month: "short", day: "numeric"}
                : {day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"}
        return new Intl.DateTimeFormat(locale, options)
    }, [granularity, locale])
    const numberFormatter = useMemo(
        () => new Intl.NumberFormat(locale, {maximumFractionDigits: 2}),
        [locale]
    );

    const availableGranularityOptions = useMemo(
        () =>
            range === "24h"
                ? granularityOptions
                : granularityOptions.filter((option) => option.value !== "raw"),
        [granularityOptions, range]
    )

    const selectedRangeOption = useMemo(
        () => rangeOptions.find((option) => option.value === range),
        [range, rangeOptions]
    );
    const selectedRangeLabel = selectedRangeOption
        ? rangeT(selectedRangeOption.labelKey)
        : "—";

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('currentView')}</p>
                    <p className="text-base font-semibold">{selectedOption?.label}</p>
                    <p className="text-xs text-muted-foreground">
                        {t('rangeLabel', {range: selectedRangeLabel})}
                    </p>
                </div>
                <ButtonGroup className="flex flex-wrap justify-end">
                    <Select value={range} onValueChange={handleRangeChange}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder={t('placeholders.range')}/>
                        </SelectTrigger>
                        <SelectContent>
                            {rangeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {rangeT(option.labelKey)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={granularity} onValueChange={handleGranularityChange}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder={t('placeholders.granularity')}/>
                        </SelectTrigger>
                        <SelectContent>
                            {availableGranularityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {granularityT(option.labelKey)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={metric} onValueChange={handleMetricChange}>
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder={t('placeholders.metric')}/>
                        </SelectTrigger>
                        <SelectContent>
                            {metricOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </ButtonGroup>
            </div>
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0.02}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                    <XAxis
                        dataKey="bucket"
                        tickFormatter={(value) => labelFormatter.format(new Date(value))}
                        tickMargin={12}
                        minTickGap={24}
                    />
                    <YAxis width={64} domain={yDomain}/>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot"/>}
                        labelFormatter={(value) => labelFormatter.format(new Date(value))}
                        formatter={(value) => [
                            numberFormatter.format(Number(value)),
                            selectedOption?.label ?? t('valueLabel'),
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    )
}
