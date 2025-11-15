"use client"

import {useEffect, useMemo, useState} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type {MetricType} from "@/models/constants"
import {CompareHoursChart} from "@/components/charts/CompareHours"
import {useTranslations, useLocale} from "next-intl";

type Dataset = {
    hourOfDay: number;
    value: number;
}

type MetricOption = {
    value: MetricType;
    label: string;
    color: string;
    unitLabel?: string;
}

type Props = {
    datasets: Record<MetricType, Dataset[]>;
    metricOptions: MetricOption[];
    initialMetric: MetricType;
    searchParamKey?: string;
}

export function HourOfDayChart({
                                    datasets,
                                    metricOptions,
                                    initialMetric,
                                    searchParamKey = "hourOfDayMetric",
                                }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const t = useTranslations('Terrariums.hourOfDay');
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

    useEffect(() => {
        setMetric(initialMetric)
    }, [initialMetric])

    const updateSearchParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (params.get(key) === value) {
            return
        }
        params.set(key, value)
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleMetricChange = (value: string) => {
        const casted = value as MetricType
        setMetric(casted)
        updateSearchParam(searchParamKey, casted)
    }

    const selectedOption =
        metricMap[metric] ?? metricMap[metricOptions[0]?.value as MetricType]
    const data = datasets[metric] ?? []
    const color = selectedOption?.color ?? "#22c55e"

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                    <p className="text-base font-semibold">{selectedOption?.label}</p>
                </div>
                <Select value={metric} onValueChange={handleMetricChange}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder={t('placeholder')}/>
                    </SelectTrigger>
                    <SelectContent>
                        {metricOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <CompareHoursChart
                data={data}
                color={color}
                label={selectedOption?.label}
                unitLabel={selectedOption?.unitLabel}
                locale={locale}
            />
        </div>
    )
}
