"use client"

import * as React from "react"
import {LayoutPanelLeftIcon, Leaf, SproutIcon} from "lucide-react"
import {NavUser} from "@/components/layout/sidebar/nav/NavUser"
import {NavSimple} from "@/components/layout/sidebar/nav/NavSimple";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar,} from "@/components/ui/sidebar"
import {WEBSITE_NAME} from "@/constants/website";
import Link from "next/link";
import {User} from "next-auth";
import Image from "next/image";
import {useTranslations} from "next-intl";
import {cn} from "@/lib/utils";

type Props = {
    user: User;
} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({user, ...props}: Props) {
    const {open} = useSidebar();
    const t = useTranslations('Navigation.Sidebar');
    const navigation = {
        app: [
            {
                title: t('links.dashboard'),
                url: "/dashboard",
                icon: LayoutPanelLeftIcon,
            },
        ],
        terrariums: [
            {
                title: t('links.terrariums'),
                url: "/dashboard/terrariums",
                icon: SproutIcon,
            },
        ],
    };

    return (
        <Sidebar variant="floating" collapsible="icon" {...props}>
            <SidebarHeader className={cn("flex mb-2 mt-1", open && 'ml-2')}>
                {open && (
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <Leaf className="size-5"/>
                        </div>
                        <div className="flex flex-col">
                        <span className="text-base font-semibold tracking-tight text-foreground">
                            {WEBSITE_NAME}
                        </span>
                            <span className="text-xs text-muted-foreground">
                            terrarium monitor
                        </span>
                        </div>
                    </Link>
                )}
                {!open && (
                    <div className="flex size-8 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Leaf className="size-5"/>
                    </div>
                )}
            </SidebarHeader>
            <SidebarContent>
                <NavSimple title={WEBSITE_NAME} items={navigation.app}/>
                <NavSimple title={t('sections.terrariums')} items={navigation.terrariums}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
