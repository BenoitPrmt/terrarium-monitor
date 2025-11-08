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
        <div className="flex flex-col min-h-screen">
            <Header session={session}/>
            <main className="container mx-auto py-4 px-4 flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    )
}