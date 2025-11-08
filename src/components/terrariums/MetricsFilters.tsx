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

const ranges = [
    {value: "24h", label: "24 h"},
    {value: "7d", label: "7 jours"},
    {value: "30d", label: "30 jours"},
]

const granularities = [
    {value: "raw", label: "Brut"},
    {value: "hourly", label: "Horaire"},
    {value: "daily", label: "Journalier"},
]

function updateQuery(
    router: ReturnType<typeof useRouter>,
    pathname: string,
    searchParams: URLSearchParams,
    key: string,
    value: string
) {
    const params = new URLSearchParams(searchParams)
    params.set(key, value)
    router.replace(`${pathname}?${params.toString()}`)
}

export function MetricsFilters({
                                   granularity,
                                   range,
                               }: {
    granularity: string
    range: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label>Granularité</Label>
                <Select
                    value={granularity}
                    onValueChange={(value) =>
                        updateQuery(router, pathname, searchParams, "granularity", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Granularité"/>
                    </SelectTrigger>
                    <SelectContent>
                        {granularities.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Période</Label>
                <Select
                    value={range}
                    onValueChange={(value) =>
                        updateQuery(router, pathname, searchParams, "range", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Période"/>
                    </SelectTrigger>
                    <SelectContent>
                        {ranges.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
