import {redirect} from "next/navigation"
import {currentUser} from "@/auth/current-user"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    requireTerrariumForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {TerrariumSettingsForm} from "@/components/terrariums/TerrariumSettingsForm"
import {RotateTokenForm} from "@/components/terrariums/RotateTokenForm"
import {DeleteTerrariumForm} from "@/components/terrariums/form/DeleteTerrariumForm"
import {getTranslations} from "next-intl/server";

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function TerrariumSettingsPage({params}: PageProps) {
    const user = await currentUser()
    const t = await getTranslations('Terrariums.settings');
    if (!user) {
        redirect("/login")
    }
    const {id} = await params;

    await connectMongoose()
    await ensureDbIndexes()

    const terrariumDoc = await requireTerrariumForOwner(id, user.id)
    const terrarium = serializeTerrarium(terrariumDoc)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('sections.details')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <TerrariumSettingsForm
                        terrariumId={terrarium.id}
                        name={terrarium.name}
                        location={terrarium.location}
                        description={terrarium.description}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('sections.token')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {t('tokenDescription')}
                    </p>
                    <RotateTokenForm terrariumId={terrarium.id}/>
                </CardContent>
            </Card>

            <Card className="border-red-300">
                <CardHeader>
                    <CardTitle className="text-red-600">{t('sections.deletion')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {t('deletionDescription')}
                    </p>
                    <DeleteTerrariumForm terrariumId={terrarium.id}/>
                </CardContent>
            </Card>
        </div>
    )
}
