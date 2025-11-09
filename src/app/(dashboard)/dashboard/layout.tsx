import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {AppSidebar} from "@/components/layout/sidebar/AppSidebar";
import {redirect} from "next/navigation";
import {requiredCurrentUser} from "@/auth/current-user";
import {DashboardBreadcrumbs} from "@/components/dashboard/DashboardBreadcrumbs";
import {ThemeToggle} from "@/components/theme/ThemeToggle";

type Props = {
    children: React.ReactNode
}

export default async function AppLayout({children}: Props) {
    try {
        const user = await requiredCurrentUser();

        if (!user) {
            redirect('/login');
        }

        return (
            <SidebarProvider>
                <AppSidebar user={user}/>
                <SidebarInset>
                    <header
                        className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex flex-1 justify-between items-center px-4">
                            <div className="flex items-center gap-2 px-4">
                                <SidebarTrigger className="-ml-1"/>
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 data-[orientation=vertical]:h-4"
                                />
                                <DashboardBreadcrumbs/>
                            </div>
                            <div className="flex items-center gap-2 px-4">
                                <ThemeToggle/>
                            </div>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    } catch {
        redirect('/login');
    }
}