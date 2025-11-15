"use client"

import * as React from "react"
import {LayoutPanelLeftIcon, SproutIcon} from "lucide-react"
import {NavUser} from "@/components/layout/sidebar/nav/NavUser"
import {NavSimple} from "@/components/layout/sidebar/nav/NavSimple";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar,} from "@/components/ui/sidebar"
import {WEBSITE_NAME} from "@/constants/website";
import Link from "next/link";
import {User} from "next-auth";
import Image from "next/image";
import {useTranslations} from "next-intl";

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
            <SidebarHeader className="flex items-center mb-2 mt-1">
                {open && (
                    <div className="flex items-center space-x-2">
                        <Image src="/assets/logo.png" alt={t('logoAlt')} width={30} height={30} className="rounded-lg" />
                        <div
                            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary-foreground"
                        >
                            <Link href="/">{WEBSITE_NAME}</Link>
                        </div>
                    </div>
                )}
                {!open && (
                    <Image src="/assets/logo.png" alt={t('logoAlt')} width={30} height={30} className="rounded-lg" />
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
