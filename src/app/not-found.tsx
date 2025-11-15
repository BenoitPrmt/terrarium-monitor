import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ghost } from "lucide-react"
import {getTranslations} from "next-intl/server";

export default async function NotFoundPage() {
    const t = await getTranslations('NotFound');
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">

            <div className="z-10 flex flex-col items-center gap-6">
                <Ghost className="h-12 w-12 text-muted-foreground" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
                <p className="text-muted-foreground text-lg max-w-md">
                    {t('description')}
                </p>
                <Link href="/">
                    <Button variant="default">{t('cta')}</Button>
                </Link>
            </div>
        </div>
    )
}
