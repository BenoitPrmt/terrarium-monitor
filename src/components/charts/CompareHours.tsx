"use client"

import {useMemo} from "react"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {useTranslations, useLocale} from "next-intl";

type Props = {
    data: Array<{
        hourOfDay: number
        value: number
    }>;
    color?: string;
    label?: string;
    unitLabel?: string;
    locale?: string;
}

export function CompareHoursChart({
                                      data,
                                      color = "#22c55e",
                                      label,
                                      unitLabel = "",
                                      locale,
                                  }: Props) {
    const t = useTranslations('Terrariums.hourOfDay');
    const resolvedLabel = label ?? t('averageLabel');
    const resolvedLocale = locale ?? useLocale();
    const numberFormatter = useMemo(
        () => new Intl.NumberFormat(resolvedLocale, {maximumFractionDigits: 2}),
        [resolvedLocale]
    );

    const config: ChartConfig = {
        value: {
            label: resolvedLabel,
            color,
        },
    }

    return (
        <ChartContainer config={config}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis
                    dataKey="hourOfDay"
                    tickFormatter={(value) => t('hourLabel', {value})}
                    interval={1}
                />
                <YAxis/>
                <ChartTooltip
                    content={<ChartTooltipContent/>}
                    labelFormatter={(value) => `${value}`}
                    formatter={(value) => [numberFormatter.format(value as number), unitLabel]}
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
