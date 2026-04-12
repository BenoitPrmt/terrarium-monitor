"use client"

import * as React from "react"
import {useSelectedLayoutSegments} from "next/navigation"

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

    const firstItem = items[0]
    const lastItem = items[items.length - 1]
    const middleItems = items.slice(1, -1)

    return (
        <Breadcrumb aria-label={t('ariaLabel')}>
            <BreadcrumbList className="min-w-0 flex-nowrap overflow-hidden sm:hidden">
                <BreadcrumbItem className="min-w-0 shrink">
                    {items.length === 1 ? (
                        <BreadcrumbPage className="block truncate">
                            {firstItem.label}
                        </BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink href={firstItem.href} className="block max-w-[7rem] truncate">
                            {firstItem.label}
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>

                {middleItems.length > 0 && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex size-9 items-center justify-center rounded-md outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
                                    <BreadcrumbEllipsis className="size-9" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {middleItems.map((item) => (
                                        <DropdownMenuItem key={item.href} asChild>
                                            <BreadcrumbLink href={item.href}>
                                                {item.label}
                                            </BreadcrumbLink>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                    </>
                )}

                {items.length > 1 && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem className="min-w-0 shrink">
                            <BreadcrumbPage className="block max-w-[10rem] truncate">
                                {lastItem.label}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>

            <BreadcrumbList className="hidden min-w-0 flex-nowrap overflow-hidden sm:flex">
                {items.map((item, index) => (
                    <React.Fragment key={item.href}>
                        <BreadcrumbItem className="min-w-0 shrink-0">
                            {index === items.length - 1 ? (
                                <BreadcrumbPage className="block max-w-[16rem] truncate">
                                    {item.label}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={item.href} className="block max-w-[12rem] truncate">
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
