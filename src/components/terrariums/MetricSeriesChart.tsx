"use client"

import {useEffect, useId, useMemo, useState} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {ButtonGroup} from "@/components/ui/button-group"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import type {AggregateGranularity, MetricType} from "@/models/constants"

type SeriesPoint = {
    bucket: string
    value: number
}

type MetricOption = {
    value: MetricType
    label: string
    color: string
}

type GranularityOption = {
    value: AggregateGranularity
    label: string
}

type RangeOption = {
    value: string
    label: string
}

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
}

export function MetricSeriesChart({
                                       dataByMetric,
                                       metricOptions,
                                       granularityOptions,
                                       rangeOptions,
                                       initialMetric,
                                       initialGranularity,
                                       initialRange,
                                   }: Props) {
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

    const updateSearchParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set(key, value)
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleMetricChange = (value: string) => {
        setMetric(value as MetricType)
    }

    const handleGranularityChange = (value: string) => {
        const casted = value as AggregateGranularity
        setGranularity(casted)
        updateSearchParam("granularity", casted)
    }

    const handleRangeChange = (value: string) => {
        setRange(value)
        updateSearchParam("range", value)
    }

    const gradientBaseId = useId().replace(/:/g, "")
    const selectedOption =
        metricMap[metric] ?? metricMap[metricOptions[0]?.value as MetricType]
    const chartData = dataByMetric[metric]?.[granularity] ?? []
    const color = selectedOption?.color ?? "#0ea5e9"
    const gradientId = `${gradientBaseId}-${metric}-fill`

    const chartConfig: ChartConfig = useMemo(
        () => ({
            value: {
                label: selectedOption?.label ?? "Valeur",
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
        return new Intl.DateTimeFormat("fr-FR", options)
    }, [granularity])

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Vue actuelle</p>
                    <p className="text-base font-semibold">{selectedOption?.label}</p>
                    <p className="text-xs text-muted-foreground">
                        Intervalle&nbsp;:{" "}
                        {rangeOptions.find((option) => option.value === range)?.label ??
                            "—"}
                    </p>
                </div>
                <ButtonGroup className="flex flex-wrap justify-end">
                    <Select value={range} onValueChange={handleRangeChange}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Période"/>
                        </SelectTrigger>
                        <SelectContent>
                            {rangeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={granularity} onValueChange={handleGranularityChange}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Granularité"/>
                        </SelectTrigger>
                        <SelectContent>
                            {granularityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={metric} onValueChange={handleMetricChange}>
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="Métrique"/>
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
                    <YAxis width={64}/>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot"/>}
                        labelFormatter={(value) => labelFormatter.format(new Date(value))}
                        formatter={(value) => [
                            `${Number(value).toFixed(2)}`,
                            selectedOption?.label ?? "Valeur",
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
