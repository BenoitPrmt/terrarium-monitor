"use client"

import {useActionState, useEffect} from "react"
import {useFormStatus} from "react-dom"

import {createWebhookAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {toast} from "sonner"

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

const initialState: ActionState | null = null

export function NewWebhookForm({terrariumId}: { terrariumId: string }) {
    const action = async (_state: ActionState | null, formData: FormData) => {
        return createWebhookAction(terrariumId, formData)
    }

    const [state, formAction] = useActionState<ActionState | null, FormData>(
        action,
        initialState
    )
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
