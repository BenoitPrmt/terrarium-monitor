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
import {TerrariumLocationBadge} from "@/components/terrariums/TerrariumLocationBadge";
import {getLocale, getTranslations} from "next-intl/server";

export default async function DashboardPage() {
    const user = await currentUser();
    const locale = await getLocale();
    const t = await getTranslations('Dashboard.Home');
    const common = await getTranslations('Common');

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
    const createdAtFormatter = new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
        timeStyle: "short",
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
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
                <Card>
                    <CardHeader>
                        <CardDescription>{t('stats.terrariums')}</CardDescription>
                        <CardTitle className="text-3xl">{terrariums.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>{t('stats.lastIngestion')}</CardDescription>
                        <CardTitle className="text-3xl">
                            {lastSample ? timeAgoInWords(new Date(lastSample.ts), {locale}) : "—"}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>{t('stats.activeWebhooks')}</CardDescription>
                        <CardTitle className="text-3xl">{webhookCount}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t('table.title')}</CardTitle>
                        <CardDescription>{t('table.description')}</CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/terrariums/new">
                            <SproutIcon className="size-4" />
                            {t('table.actions.new')}
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{common('fields.name')}</TableHead>
                                <TableHead>{common('fields.location')}</TableHead>
                                <TableHead>UUID</TableHead>
                                <TableHead>{common('fields.createdAt')}</TableHead>
                                <TableHead className="text-right">{common('fields.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {terrariums.map((terrarium) => (
                                <TableRow key={terrarium.id}>
                                    <TableCell className="font-medium">
                                        {terrarium.name}
                                    </TableCell>
                                    <TableCell>
                                        <TerrariumLocationBadge value={terrarium.location}/>
                                    </TableCell>
                                    <TableCell>
                                        <CopyCode text={terrarium.uuid} />
                                    </TableCell>
                                    <TableCell>
                                        {terrarium.createdAt
                                            ? createdAtFormatter.format(new Date(terrarium.createdAt))
                                            : common('status.notAvailable')}
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
                                                        <p>{t('table.actions.view')}</p>
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
                                                        <p>{t('table.actions.settings')}</p>
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
                                                        <p>{t('table.actions.webhooks')}</p>
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
                                        {t('table.empty')}
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
