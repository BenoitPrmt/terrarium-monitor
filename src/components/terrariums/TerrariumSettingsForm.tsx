"use client"

import {useActionState} from "react"
import {useFormStatus} from "react-dom"

import {updateTerrariumAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"

type Props = {
    terrariumId: string
    name: string
    location?: string | null
    description?: string | null
}

type ActionState = Awaited<ReturnType<typeof updateTerrariumAction>>

const initialState: ActionState = {}

export function TerrariumSettingsForm({
                                          terrariumId,
                                          name,
                                          location,
                                          description,
                                      }: Props) {
    const action = async (_state: ActionState, formData: FormData) => {
        return updateTerrariumAction(terrariumId, formData)
    }

    const [state, formAction] = useActionState<ActionState, FormData>(
        action,
        initialState
    )

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" defaultValue={name} required/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Emplacement</Label>
                <Input id="location" name="location" defaultValue={location ?? ""}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={description ?? ""}
                    rows={4}
                />
            </div>
            {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
            )}
            {state?.success && (
                <p className="text-sm text-emerald-600">{state.success}</p>
            )}
            <SubmitButton/>
        </form>
    )
}

function SubmitButton() {
    const {pending} = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer"}
        </Button>
    )
}
