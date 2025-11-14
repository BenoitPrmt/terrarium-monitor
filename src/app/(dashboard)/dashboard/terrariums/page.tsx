import Link from "next/link"
import { redirect } from "next/navigation"

import { currentUser } from "@/auth/current-user"
import { ensureDbIndexes } from "@/lib/db/ensureIndexes"
import { connectMongoose } from "@/lib/db/mongoose"
import { listTerrariumsForOwner, serializeTerrarium } from "@/lib/services/terrariums"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {TerrariumLocationBadge} from "@/components/terrariums/TerrariumLocationBadge"
import {SproutIcon} from "lucide-react";
import {getLocale, getTranslations} from "next-intl/server";

export default async function TerrariumsGridPage() {
    const user = await currentUser()
    const locale = await getLocale();
    const t = await getTranslations('Terrariums.list');
    const common = await getTranslations('Common');
    if (!user) {
        redirect("/login")
    }

    await connectMongoose()
    await ensureDbIndexes()

    const terrariumDocs = await listTerrariumsForOwner(user.id)
    const terrariums = terrariumDocs.map(serializeTerrarium)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/terrariums/new">
                        <SproutIcon className="size-4" />
                        {common('actions.newTerrarium')}
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {terrariums.map((terrarium) => (
                    <Link
                        href={`/dashboard/terrariums/${terrarium.id}`}
                        key={terrarium.id}
                        className="group"
                    >
                        <Card className="h-full transition hover:shadow-lg focus-within:ring-2 focus-within:ring-ring">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-lg">
                                    <span className="truncate">{terrarium.name}</span>
                                    <TerrariumLocationBadge value={terrarium.location}/>
                                </CardTitle>
                                <CardDescription>
                                    UUID&nbsp;: <span className="font-mono text-xs">{terrarium.uuid}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p className="text-muted-foreground line-clamp-3">
                                    {terrarium.description || t('emptyDescription')}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                    {t('createdOn')}{" "}
                                    {terrarium.createdAt
                                        ? new Intl.DateTimeFormat(locale, {
                                              dateStyle: "long",
                                          }).format(new Date(terrarium.createdAt))
                                        : common('status.notAvailable')}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {terrariums.length === 0 && (
                    <Card className="sm:col-span-2 lg:col-span-3">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            {t('emptyState')}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
