"use client"

import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

type Props = {
    data: Array<{
        hourOfDay: number
        value: number
    }>
    color?: string
    label?: string
}

export function CompareHoursChart({
                                      data,
                                      color = "#22c55e",
                                      label = "Moyenne",
                                  }: Props) {
    const config: ChartConfig = {
        value: {
            label,
            color,
        },
    }

    return (
        <ChartContainer config={config}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis
                    dataKey="hourOfDay"
                    tickFormatter={(value) => `${value}h`}
                    interval={1}
                />
                <YAxis/>
                <ChartTooltip
                    content={<ChartTooltipContent/>}
                    labelFormatter={(value) => `${value}h`}
                    formatter={(value) => [`${value as number}`, label]}
                />
                <Bar
                    dataKey="value"
                    fill={`var(--color-value, ${color})`}
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    )
}
