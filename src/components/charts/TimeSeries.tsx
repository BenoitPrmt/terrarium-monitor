"use client"

import {useMemo} from "react"
import {
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

type SeriesConfig = {
    key: string
    label: string
    color: string
}

export type TimeSeriesDatum = {
    bucket: string
    [key: string]: number | string
}

type Props = {
    data: TimeSeriesDatum[]
    series: SeriesConfig[]
    granularity: "raw" | "hourly" | "daily"
}

export function TimeSeriesChart({data, series, granularity}: Props) {
    const config = useMemo(() => {
        return series.reduce<ChartConfig>((acc, item) => {
            acc[item.key] = {label: item.label, color: item.color}
            return acc
        }, {})
    }, [series])

    const formatter = useMemo(() => {
        const options: Intl.DateTimeFormatOptions =
            granularity === "daily"
                ? {month: "short", day: "numeric"}
                : {hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short"}
        return new Intl.DateTimeFormat(undefined, {
            timeZone: "UTC",
            ...options,
        })
    }, [granularity])

    return (
        <ChartContainer config={config}>
            <LineChart data={data} margin={{left: 12, right: 12}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis
                    dataKey="bucket"
                    tickFormatter={(value) => formatter.format(new Date(value))}
                    minTickGap={24}
                />
                <YAxis width={60}/>
                <ChartTooltip
                    content={<ChartTooltipContent/>}
                    labelFormatter={(value) => formatter.format(new Date(value))}
                />
                {series.map((serie) => (
                    <Line
                        key={serie.key}
                        type="monotone"
                        dataKey={serie.key}
                        stroke={`var(--color-${serie.key})`}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ChartContainer>
    )
}
