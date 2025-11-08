"use client"

import {useEffect, useState, useTransition, useActionState} from "react"
import {useFormStatus} from "react-dom"

import {
    deleteWebhookAction,
    testWebhookAction,
    updateWebhookAction,
} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {Badge} from "@/components/ui/badge"
import type {MetricType} from "@/models/constants"

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

type Props = {
    terrariumId: string
    webhook: {
        id: string
        name: string
        url: string
        metric: MetricType
        comparator: string
        threshold: number
        cooldownSec: number
        isActive: boolean
        secretId?: string
        lastTriggeredAt?: string
    }
}

type ActionState = Awaited<ReturnType<typeof updateWebhookAction>>

const initialState: ActionState = {}

export function WebhookCard({terrariumId, webhook}: Props) {
    const action = async (_state: ActionState, formData: FormData) => {
        return updateWebhookAction(terrariumId, webhook.id, formData)
    }

    const [state, formAction] = useActionState<ActionState, FormData>(
        action,
        initialState
    )
    const [metric, setMetric] = useState(webhook.metric)
    const [comparator, setComparator] = useState(webhook.comparator)
    const [isActive, setIsActive] = useState(webhook.isActive)
    const [testPending, startTest] = useTransition()
    const [deletePending, startDelete] = useTransition()

    useEffect(() => {
        if (state?.data) {
            const data = state.data as {
                metric?: MetricType
                comparator?: string
                isActive?: boolean
            }
            if (data.metric) setMetric(data.metric)
            if (data.comparator) setComparator(data.comparator)
            if (typeof data.isActive === "boolean") setIsActive(data.isActive)
        }
    }, [state?.data])

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <form action={formAction} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor={`name-${webhook.id}`}>Nom</Label>
                        <Input
                            id={`name-${webhook.id}`}
                            name="name"
                            defaultValue={webhook.name}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`url-${webhook.id}`}>URL</Label>
                        <Input
                            id={`url-${webhook.id}`}
                            name="url"
                            defaultValue={webhook.url}
                            type="url"
                            required
                        />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <Label>Metric</Label>
                        <select
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                            value={metric}
                            onChange={(event) => setMetric(event.target.value as MetricType)}
                        >
                            {metricOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <input type="hidden" name="metric" value={metric}/>
                    </div>
                    <div className="space-y-2">
                        <Label>Comparateur</Label>
                        <select
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                            value={comparator}
                            onChange={(event) => setComparator(event.target.value)}
                        >
                            {comparatorOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <input type="hidden" name="comparator" value={comparator}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`threshold-${webhook.id}`}>Seuil</Label>
                        <Input
                            id={`threshold-${webhook.id}`}
                            name="threshold"
                            type="number"
                            step="0.1"
                            defaultValue={webhook.threshold}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`cooldown-${webhook.id}`}>Cooldown (sec)</Label>
                        <Input
                            id={`cooldown-${webhook.id}`}
                            name="cooldownSec"
                            type="number"
                            defaultValue={webhook.cooldownSec}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Switch
                            id={`active-${webhook.id}`}
                            checked={isActive}
                            onCheckedChange={(checked) => setIsActive(checked)}
                        />
                        <Label htmlFor={`active-${webhook.id}`}>Actif</Label>
                        <input
                            type="hidden"
                            name="isActive"
                            value={isActive ? "true" : "false"}
                        />
                    </div>
                    <SubmitButton/>
                </div>
                {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
                {state?.success && (
                    <p className="text-sm text-emerald-600">{state.success}</p>
                )}
            </form>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {webhook.secretId && (
                    <Badge variant="secondary">secret: {webhook.secretId}</Badge>
                )}
                {webhook.lastTriggeredAt && (
                    <span>
            Dernier envoi: {new Date(webhook.lastTriggeredAt).toLocaleString()}
          </span>
                )}
            </div>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    disabled={testPending}
                    onClick={() =>
                        startTest(async () => {
                            await testWebhookAction(terrariumId, webhook.id)
                        })
                    }
                >
                    {testPending ? "Test..." : "Tester"}
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    disabled={deletePending}
                    onClick={() =>
                        startDelete(async () => {
                            await deleteWebhookAction(terrariumId, webhook.id)
                        })
                    }
                >
                    {deletePending ? "Suppression..." : "Supprimer"}
                </Button>
            </div>
        </div>
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
