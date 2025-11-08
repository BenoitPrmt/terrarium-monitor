import Link from "next/link"
import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {LogoutButton} from "@/components/auth/LogoutButton"

type Props = {
    children: React.ReactNode
}

export default async function DashboardLayout({children}: Props) {
    const user = await currentUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-xl font-semibold">
                            Terrarium Monitor
                        </Link>
                        <nav className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Link href="/dashboard" className="hover:text-foreground">
                                Dashboard
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <LogoutButton/>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    )
}
