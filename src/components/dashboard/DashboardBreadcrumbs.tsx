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
import {useTranslations} from "next-intl";

export function DashboardBreadcrumbs() {
    const segments = useSelectedLayoutSegments()
    const t = useTranslations('Navigation.Breadcrumbs');
    const labelKeyMap: Record<string, string> = {
        terrariums: 'segments.terrariums',
        new: 'segments.new',
        settings: 'segments.settings',
        webhooks: 'segments.webhooks',
        dashboard: 'segments.dashboard',
    };

    const formatLabel = React.useCallback((segment: string) => {
        const key = labelKeyMap[segment];
        if (key) {
            return t(key);
        }
        return segment
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }, [t]);

    const items = React.useMemo(() => {
        const list: Array<{ href: string; label: string }> = [
            {href: "/dashboard", label: formatLabel("dashboard")},
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
    }, [formatLabel, segments])

    return (
        <Breadcrumb aria-label={t('ariaLabel')}>
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
