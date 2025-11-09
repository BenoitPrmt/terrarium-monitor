import Link from "next/link"
import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    listTerrariumsForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums"
import {SampleModel} from "@/models/Sample"
import {WebhookModel} from "@/models/Webhook"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {EyeIcon, SettingsIcon, SproutIcon, WebhookIcon} from "lucide-react";
import {ButtonGroup} from "@/components/ui/button-group";
import {timeAgoInWords} from "@/lib/utils";
import CopyCode from "@/components/CopyCode";

export default async function DashboardPage() {
    const user = await currentUser()
    if (!user) {
        redirect("/login")
    }

    await connectMongoose()
    await ensureDbIndexes()

    const terrariumDocs = await listTerrariumsForOwner(user.id)
    const terrariums = terrariumDocs.map(serializeTerrarium)
    const terrariumIds = terrariumDocs.map((doc) => doc._id)

    const [lastSample, webhookCount] = await Promise.all([
        terrariumIds.length
            ? SampleModel.findOne({terrariumId: {$in: terrariumIds}})
                .sort({ts: -1})
                .lean()
            : null,
        terrariumIds.length
            ? WebhookModel.countDocuments({terrariumId: {$in: terrariumIds}})
            : 0,
    ])

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Suivez tous vos terrariums et leurs dernières mesures.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/terrariums/new">
                        <SproutIcon className="size-4" />
                        Nouveau terrarium
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Terrariums</CardDescription>
                        <CardTitle className="text-3xl">{terrariums.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Dernière ingestion</CardDescription>
                        <CardTitle className="text-3xl">
                            {lastSample ? timeAgoInWords(new Date(lastSample.ts)) : "—"}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Webhooks actifs</CardDescription>
                        <CardTitle className="text-3xl">{webhookCount}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Terrariums</CardTitle>
                        <CardDescription>Gestion de vos appareils connectés.</CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/terrariums/new">
                            <SproutIcon className="size-4" />
                            Nouveau
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Lieu</TableHead>
                                <TableHead>UUID</TableHead>
                                <TableHead>Créé le</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {terrariums.map((terrarium) => (
                                <TableRow key={terrarium.id}>
                                    <TableCell className="font-medium">
                                        {terrarium.name}
                                    </TableCell>
                                    <TableCell>{terrarium.location || "—"}</TableCell>
                                    <TableCell>
                                        <CopyCode text={terrarium.uuid} />
                                    </TableCell>
                                    <TableCell>
                                        {terrarium.createdAt
                                            ? new Date(terrarium.createdAt).toLocaleString("fr-FR", {
                                                dateStyle: "long",
                                                timeStyle: "short",
                                            })
                                            : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <ButtonGroup>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link
                                                                href={`/dashboard/terrariums/${terrarium.id}`}
                                                            >
                                                                <EyeIcon className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Voir le terrarium</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link
                                                                href={`/dashboard/terrariums/${terrarium.id}/settings`}
                                                            >
                                                                <SettingsIcon className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Paramètres du terrarium</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link
                                                                href={`/dashboard/terrariums/${terrarium.id}/webhooks`}
                                                            >
                                                                <WebhookIcon className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Gérer les webhooks</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </ButtonGroup>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {terrariums.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Aucun terrarium pour le moment.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
