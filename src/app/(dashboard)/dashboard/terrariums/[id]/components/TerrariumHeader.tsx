import Link from "next/link"
import {SettingsIcon, WebhookIcon} from "lucide-react"

import CopyCode from "@/components/CopyCode"
import {TerrariumLocationBadge} from "@/components/terrariums/TerrariumLocationBadge"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {ButtonGroup} from "@/components/ui/button-group"
import type {TerrariumSummary} from "@/types/terrarium"

type TerrariumHeaderProps = {
    terrarium: TerrariumSummary
}

export function TerrariumHeader({terrarium}: TerrariumHeaderProps) {
    const creationLabel = terrarium.createdAt
        ? new Date(terrarium.createdAt).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
        })
        : "—"

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-sm text-muted-foreground">Terrarium</p>
                <h1 className="text-3xl font-semibold">{terrarium.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    Identifiant :&nbsp;
                    <CopyCode text={terrarium.uuid}/>
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <TerrariumLocationBadge value={terrarium.location} variant="outline"/>
                    <Badge variant="outline">Créé le&nbsp;: {creationLabel}</Badge>
                </div>
            </div>
            <div className="flex gap-2">
                <ButtonGroup>
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/terrariums/${terrarium.id}/settings`}>
                            <SettingsIcon className="size-4"/>
                            Paramètres
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/terrariums/${terrarium.id}/webhooks`}>
                            <WebhookIcon className="size-4"/>
                            Webhooks
                        </Link>
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    )
}
