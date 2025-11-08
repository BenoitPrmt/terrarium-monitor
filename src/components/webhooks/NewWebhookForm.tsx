"use client"

import {useActionState} from "react"
import {useFormStatus} from "react-dom"

import {createWebhookAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"

const metricOptions = [
    {value: "TEMPERATURE", label: "Température"},
    {value: "HUMIDITY", label: "Humidité"},
    {value: "PRESSURE", label: "Pression"},
    {value: "ALTITUDE", label: "Altitude"},
]

const comparatorOptions = [
    {value: "gt", label: ">"},
    {value: "gte", label: ">="},
    {value: "lt", label: "<"},
    {value: "lte", label: "<="},
]

type ActionState = Awaited<ReturnType<typeof createWebhookAction>>

const initialState: ActionState = {}

export function NewWebhookForm({terrariumId}: { terrariumId: string }) {
    const action = async (_state: ActionState, formData: FormData) => {
        return createWebhookAction(terrariumId, formData)
    }

    const [state, formAction] = useActionState<ActionState, FormData>(
        action,
        initialState
    )

    return (
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" required/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" type="url" required/>
            </div>
            <div className="space-y-2">
                <Label>Metric</Label>
                <select
                    name="metric"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                    defaultValue="HUMIDITY"
                >
                    {metricOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <Label>Comparateur</Label>
                <select
                    name="comparator"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                    defaultValue="gt"
                >
                    {comparatorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="threshold">Seuil</Label>
                <Input id="threshold" name="threshold" type="number" step="0.1" required/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="cooldownSec">Cooldown (sec)</Label>
                <Input id="cooldownSec" name="cooldownSec" type="number" defaultValue={900}/>
            </div>
            {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
            )}
            {state?.success && (
                <p className="text-sm text-emerald-600">{state.success}</p>
            )}
            <div className="md:col-span-2">
                <SubmitButton/>
            </div>
        </form>
    )
}

function SubmitButton() {
    const {pending} = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Création..." : "Créer"}
        </Button>
    )
}
