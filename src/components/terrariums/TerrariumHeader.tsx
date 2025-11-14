import Link from "next/link"
import {SettingsIcon, WebhookIcon} from "lucide-react"

import CopyCode from "@/components/CopyCode"
import {TerrariumLocationBadge} from "@/components/terrariums/TerrariumLocationBadge"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {ButtonGroup} from "@/components/ui/button-group"
import type {TerrariumSummary} from "@/types/terrarium"
import {getTranslations, getLocale} from "next-intl/server";

type TerrariumHeaderProps = {
    terrarium: TerrariumSummary
}

export async function TerrariumHeader({terrarium}: TerrariumHeaderProps) {
    const t = await getTranslations('Terrariums.header');
    const common = await getTranslations('Common');
    const locale = await getLocale();
    const creationLabel = terrarium.createdAt
        ? new Intl.DateTimeFormat(locale, {
            dateStyle: "long",
            timeStyle: "short",
        }).format(new Date(terrarium.createdAt))
        : common('status.notAvailable')

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-sm text-muted-foreground">{t('label')}</p>
                <h1 className="text-3xl font-semibold">{terrarium.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    {t('identifier')}
                    <CopyCode text={terrarium.uuid}/>
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <TerrariumLocationBadge value={terrarium.location} variant="outline"/>
                    <Badge variant="outline">{t('createdOn', {date: creationLabel})}</Badge>
                </div>
            </div>
            <div className="flex gap-2">
                <ButtonGroup>
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/terrariums/${terrarium.id}/settings`}>
                            <SettingsIcon className="size-4"/>
                            {t('actions.settings')}
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/terrariums/${terrarium.id}/webhooks`}>
                            <WebhookIcon className="size-4"/>
                            {t('actions.webhooks')}
                        </Link>
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    )
}
