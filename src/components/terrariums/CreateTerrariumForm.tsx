"use client"

import {useActionState, useEffect, useState} from "react"
import {useFormStatus} from "react-dom"

import {createTerrariumAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Loader2Icon, SproutIcon} from "lucide-react";
import {TERRARIUM_LOCATIONS} from "@/constants/terrarium-locations"
import {getLocationIcon} from "@/components/terrariums/locationIcons"
import {toast} from "sonner"

type ActionState = Awaited<ReturnType<typeof createTerrariumAction>>

const initialState: ActionState | null = null

export function CreateTerrariumForm() {
    const action = async (_: ActionState | null, formData: FormData): Promise<ActionState> => {
        return createTerrariumAction(formData)
    }

    const [state, formAction] = useActionState<ActionState | null, FormData>(
        action,
        initialState
    )
    const [copied, setCopied] = useState(false)
    const [location, setLocation] = useState<string>(TERRARIUM_LOCATIONS[0].value)
    useEffect(() => {
        if (!state?.message) {
            return
        }
        if (state.success) {
            toast.success(state.message)
        } else {
            toast.error(state.message)
        }
    }, [state])

    const token = (state?.data as { deviceToken?: string } | undefined)?.deviceToken

    return (
        <div className="space-y-6">
            <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" name="name" placeholder="Terrarium tropical" required/>
                </div>
                <div className="space-y-2">
                    <Label>Emplacement</Label>
                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un emplacement"/>
                        </SelectTrigger>
                        <SelectContent>
                            {TERRARIUM_LOCATIONS.map((option) => {
                                const Icon = getLocationIcon(option.value)
                                return (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="flex items-center gap-2">
                                            <Icon className="size-4"/>
                                            {option.label}
                                        </span>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                    <input type="hidden" name="location" value={location}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Notes sur le dispositif, capteurs, etc."
                        rows={4}
                    />
                </div>
                <SubmitButton/>
            </form>

            {token && (
                <Alert>
                    <AlertTitle>Device token</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2">
                        <span>
                          Ce token est affiché une seule fois. Copiez-le et configurez votre
                          appareil immédiatement.
                        </span>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-sm">
                                {token}
                            </code>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(token)
                                    setCopied(true)
                                    setTimeout(() => setCopied(false), 2000)
                                }}
                            >
                                {copied ? "Copié" : "Copier"}
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}

function SubmitButton() {
    const {pending} = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Création...
                </>
            ) : (
                <>
                    <SproutIcon className="size-4" />
                    Créer le terrarium
                </>
            )}
        </Button>
    )
}
