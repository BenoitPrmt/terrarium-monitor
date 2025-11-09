"use client"

import * as React from "react"
import {CircleGaugeIcon, Grid2X2, SwordsIcon,} from "lucide-react"
import {NavUser} from "@/components/layout/sidebar/nav/NavUser"
import {NavSimple} from "@/components/layout/sidebar/nav/NavSimple";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar,} from "@/components/ui/sidebar"
import {WEBSITE_NAME} from "@/constants/website";
import Link from "next/link";
import {User} from "next-auth";

const data = {
    app: [
        {
            title: "Tableau de bord",
            url: "/dashboard",
            icon: Grid2X2,
        },
    ],
    terrariums: [
        {
            title: "Terrariums",
            url: "/dashboard/terrariums",
            icon: SwordsIcon,
        },
    ],
}

type Props = {
    user: User;
} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({user, ...props}: Props) {
    const {open} = useSidebar();
    
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="flex items-center my-2">
                {open && (
                    <div
                        className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                        <Link href="/">{WEBSITE_NAME}</Link>
                    </div>
                )}
                {!open && (
                    <div
                        className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                        <Link href="/">{WEBSITE_NAME[0]}</Link>
                    </div>
                )}
            </SidebarHeader>
            <SidebarContent>
                <NavSimple title={WEBSITE_NAME} items={data.app}/>
                <NavSimple title="Terrariums" items={data.terrariums}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
