"use client"

import {useActionState, useState} from "react"
import {useFormStatus} from "react-dom"

import {updateTerrariumAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"

type Props = {
    terrariumId: string
}

type ActionState = Awaited<ReturnType<typeof updateTerrariumAction>>

const initialState: ActionState = {}

export function RotateTokenForm({terrariumId}: Props) {
    const action = async (_state: ActionState, formData: FormData) => {
        formData.set("regenerateToken", "true")
        return updateTerrariumAction(terrariumId, formData)
    }

    const [state, formAction] = useActionState<ActionState, FormData>(
        action,
        initialState
    )
    const [copied, setCopied] = useState(false)

    const token = (state?.data as { deviceToken?: string } | undefined)?.deviceToken

    return (
        <div className="space-y-4">
            <form action={formAction}>
                <RotateButton/>
            </form>
            {token && (
                <Alert>
                    <AlertTitle>Nouveau token</AlertTitle>
                    <AlertDescription className="flex items-center gap-2">
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
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}

function RotateButton() {
    const {pending} = useFormStatus()
    return (
        <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? "Rotation..." : "Regénérer le token"}
        </Button>
    )
}
