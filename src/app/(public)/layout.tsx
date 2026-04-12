import Header from "@/components/layout/base/Header";
import Footer from "@/components/layout/base/Footer";
import {Metadata} from "next";
import {WEBSITE_NAME, WEBSITE_TAGLINE} from "@/constants/website";
import {currentUser} from "@/auth/current-user";
import {User} from "next-auth";

type Props = {
    children: React.ReactNode
}

export const metadata: Metadata = {
    title: `${WEBSITE_NAME}, ${WEBSITE_TAGLINE}`,
};

export default async function MarketingLayout({children}: Props) {
    const session: User | null = await currentUser();

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-lime-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/30">
            <div className="flex min-h-screen flex-col">
            <Header session={session}/>
            <main className="flex-1 px-4 py-6 sm:py-8">
                {children}
            </main>
            <Footer />
            </div>
        </div>
    )
}
