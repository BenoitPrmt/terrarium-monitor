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
import {DeleteTerrariumForm} from "@/components/terrariums/DeleteTerrariumForm"

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function TerrariumSettingsPage({params}: PageProps) {
    const user = await currentUser()
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
                <h1 className="text-2xl font-semibold">Paramètres</h1>
                <p className="text-muted-foreground">
                    Gérez les informations publiques et les accès de votre terrarium.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informations</CardTitle>
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
                    <CardTitle>Token d’accès appareil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Le token n’est pas stocké en clair. Pour connecter un nouvel appareil ou
                        remplacer un capteur, régénérez un token et mettez à jour votre
                        configuration.
                    </p>
                    <RotateTokenForm terrariumId={terrarium.id}/>
                </CardContent>
            </Card>

            <Card className="border-red-300">
                <CardHeader>
                    <CardTitle className="text-red-600">Suppression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Cette action est irréversible et supprimera toutes les données associées.
                    </p>
                    <DeleteTerrariumForm terrariumId={terrarium.id}/>
                </CardContent>
            </Card>
        </div>
    )
}
