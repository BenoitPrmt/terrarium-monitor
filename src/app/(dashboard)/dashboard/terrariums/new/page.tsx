import Link from "next/link"
import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {CreateTerrariumForm} from "@/components/terrariums/form/CreateTerrariumForm"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {getTranslations} from "next-intl/server";

export default async function NewTerrariumPage() {
    const user = await currentUser()
    const t = await getTranslations('Terrariums.new');
    const common = await getTranslations('Common');
    if (!user) {
        redirect("/login")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard">{common('actions.back')}</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t('formTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateTerrariumForm/>
                </CardContent>
            </Card>
        </div>
    )
}
