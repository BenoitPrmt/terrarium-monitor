"use client"

import {useActionState, useState} from "react"
import {useFormStatus} from "react-dom"

import {createTerrariumAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {Loader2Icon, SendIcon, SproutIcon} from "lucide-react";

type ActionState = Awaited<ReturnType<typeof createTerrariumAction>>

const initialState: ActionState = {}

export function CreateTerrariumForm() {
    const action = async (_: ActionState, formData: FormData): Promise<ActionState> => {
        return createTerrariumAction(formData)
    }

    const [state, formAction] = useActionState<ActionState, FormData>(
        action,
        initialState
    )
    const [copied, setCopied] = useState(false)

    const token = (state?.data as { deviceToken?: string } | undefined)?.deviceToken

    return (
        <div className="space-y-6">
            <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" name="name" placeholder="Terrarium tropical" required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Emplacement</Label>
                    <Input id="location" name="location" placeholder="Salon"/>
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
                {state.error && (
                    <p className="text-sm text-red-600">{state.error}</p>
                )}
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
