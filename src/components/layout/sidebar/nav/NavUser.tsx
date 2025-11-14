"use client"

import {BadgeCheck, ChevronsUpDown, LogOut} from "lucide-react"

import {Avatar, AvatarFallback,} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "@/components/ui/sidebar"
import Link from "next/link";
import {signOut} from "next-auth/react";
import {User} from "next-auth";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getLocaleFlag, Locale, locales} from "@/i18n/config";
import {useLocale} from "next-intl";
import {setUserLocale} from "@/services/locale";

type Props = {
    user: User
}

export function NavUser({user}: Props) {
    const {isMobile} = useSidebar();
    const locale = useLocale();
    const displayName = user.name ?? user.email ?? "Utilisateur";
    const fallback = displayName.slice(0, 2).toUpperCase();

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/login';
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg">
                                    {fallback}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {displayName}
                                </span>
                                <span className="truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-6 px-1 py-1.5 text-left text-sm">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">
                                            {fallback}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                  <span className="truncate font-semibold">
                                    {displayName}
                                  </span>
                                        <span className="truncate text-xs">
                                    {user.email}
                                  </span>
                                    </div>
                                </div>

                                {/* Language selector */}
                                <Select
                                    defaultValue={locale}
                                    aria-label="Select Language"
                                    onValueChange={async (value) => {
                                        await setUserLocale(value as Locale)
                                    }}
                                >
                                    <SelectTrigger
                                        className="w-[60px] h-8 px-2">
                                        <SelectValue/>
                                    </SelectTrigger>

                                    <SelectContent className="min-w-[60px]">
                                        {locales.map(locale => (
                                            <SelectItem
                                                key={locale}
                                                value={locale}
                                                aria-label={locale}
                                                className="text-center mx-auto cursor-pointer justify-center [&>span:first-child]:hidden [&>span]:text-center [&>span]:w-full pr-0 pl-0"
                                            >
                                                <span className="text-xl mx-auto">{getLocaleFlag(locale)}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings">
                                    <BadgeCheck/>
                                    Mon compte
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut/>
                            Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}