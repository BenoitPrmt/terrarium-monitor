"use client"

import {usePathname, useRouter, useSearchParams} from "next/navigation"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Label} from "@/components/ui/label"

const metrics = [
    {value: "TEMPERATURE", label: "Température"},
    {value: "HUMIDITY", label: "Humidité"},
    {value: "PRESSURE", label: "Pression"},
    {value: "ALTITUDE", label: "Altitude"},
]

function updateParam(
    router: ReturnType<typeof useRouter>,
    pathname: string,
    params: URLSearchParams,
    value: string
) {
    const next = new URLSearchParams(params)
    next.set("hodMetric", value)
    router.replace(`${pathname}?${next.toString()}`)
}

export function HourMetricSelect({value}: { value: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    return (
        <div className="space-y-2">
            <Label>Metric pour l'analyse horaire</Label>
            <Select
                value={value}
                onValueChange={(val) => updateParam(router, pathname, searchParams, val)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Metric"/>
                </SelectTrigger>
                <SelectContent>
                    {metrics.map((metric) => (
                        <SelectItem key={metric.value} value={metric.value}>
                            {metric.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
