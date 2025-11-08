"use client"

import {type LucideIcon} from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";

type Props = {
    title: string;
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
    }[]
}

export function NavSimple({ title, items}: Props) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton tooltip={item.title} asChild>
                            <Link href={item.url}>
                                {item.icon && <item.icon/>}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
