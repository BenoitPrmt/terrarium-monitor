import Link from "next/link"
import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {CreateTerrariumForm} from "@/components/terrariums/CreateTerrariumForm"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"

export default async function NewTerrariumPage() {
    const user = await currentUser()
    if (!user) {
        redirect("/login")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Nouveau terrarium</h1>
                    <p className="text-muted-foreground">
                        Configurez un appareil et récupérez son token d’accès.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard">Retour</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateTerrariumForm/>
                </CardContent>
            </Card>
        </div>
    )
}
