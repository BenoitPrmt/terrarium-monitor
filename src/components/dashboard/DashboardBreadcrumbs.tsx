"use client"

import * as React from "react"
import {useSelectedLayoutSegments} from "next/navigation"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const labelMap: Record<string, string> = {
    terrariums: "Terrariums",
    new: "Nouveau",
    settings: "Paramètres",
    webhooks: "Webhooks",
    dashboard: "Dashboard",
}

function formatLabel(segment: string) {
    if (labelMap[segment]) {
        return labelMap[segment]
    }

    return segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
}

export function DashboardBreadcrumbs() {
    const segments = useSelectedLayoutSegments()

    const items = React.useMemo(() => {
        const list: Array<{ href: string; label: string }> = [
            {href: "/dashboard", label: "Dashboard"},
        ]

        let href = "/dashboard"
        segments.forEach((segment) => {
            href += `/${segment}`
            list.push({
                href,
                label: formatLabel(segment),
            })
        })

        return list
    }, [segments])

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbSeparator/>

                {items.map((item, index) => (
                    <React.Fragment key={item.href}>
                        <BreadcrumbItem>
                            {index === items.length - 1 ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={item.href}>
                                    {item.label}
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {index < items.length - 1 ? <BreadcrumbSeparator/> : null}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
