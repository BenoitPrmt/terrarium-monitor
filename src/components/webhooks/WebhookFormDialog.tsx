"use client"

import {type ReactNode, useActionState, useEffect, useState} from "react"
import {useFormStatus} from "react-dom"
import {CirclePlusIcon, PencilIcon} from "lucide-react"
import {toast} from "sonner"
import {useTranslations} from "next-intl"

import {
    createWebhookAction,
    updateWebhookAction,
} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import type {MetricType} from "@/models/constants"

const comparatorOptions = [
    {value: "gt", label: ">"},
    {value: "gte", label: ">="},
    {value: "lt", label: "<"},
    {value: "lte", label: "<="},
]

type WebhookFormValue = {
    id?: string
    name: string
    url: string
    metric: MetricType
    comparator: string
    threshold: number
    cooldownSec: number
    isActive: boolean
}

type Props = {
    terrariumId: string
    mode: "create" | "edit"
    webhook?: WebhookFormValue
    trigger?: ReactNode
}

type ActionState =
    | Awaited<ReturnType<typeof createWebhookAction>>
    | Awaited<ReturnType<typeof updateWebhookAction>>

const defaults: WebhookFormValue = {
    name: "",
    url: "",
    metric: "HUMIDITY",
    comparator: "gt",
    threshold: 70,
    cooldownSec: 900,
    isActive: true,
}

export function WebhookFormDialog({terrariumId, mode, webhook, trigger}: Props) {
    const t = useTranslations("Webhooks.form")
    const metricsT = useTranslations("Common.metrics")
    const [open, setOpen] = useState(false)
    const initialValue = webhook ?? defaults
    const [metric, setMetric] = useState<MetricType>(initialValue.metric)
    const [comparator, setComparator] = useState(initialValue.comparator)
    const [isActive, setIsActive] = useState(initialValue.isActive)

    const [state, formAction] = useActionState<ActionState | null, FormData>(
        async (_state, formData) => {
            if (mode === "edit" && webhook?.id) {
                return updateWebhookAction(terrariumId, webhook.id, formData)
            }

            return createWebhookAction(terrariumId, formData)
        },
        null
    )

    useEffect(() => {
        if (!state?.message) {
            return
        }

        if (state.success) {
            toast.success(state.message)
            setOpen(false)
        } else {
            toast.error(state.message)
        }
    }, [state])

    useEffect(() => {
        if (!open) {
            return
        }

        const next = webhook ?? defaults
        setMetric(next.metric)
        setComparator(next.comparator)
        setIsActive(next.isActive)
    }, [open, webhook])

    const metricOptions = [
        {value: "TEMPERATURE", label: metricsT("temperature")},
        {value: "HUMIDITY", label: metricsT("humidity")},
        {value: "PRESSURE", label: metricsT("pressure")},
        {value: "ALTITUDE", label: metricsT("altitude")},
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        <CirclePlusIcon className="size-4" />
                        {t("dialog.createTrigger")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create"
                            ? t("dialog.createTitle")
                            : t("dialog.editTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? t("dialog.createDescription")
                            : t("dialog.editDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor={`${mode}-webhook-name`}>
                            {t("fields.name")}
                        </Label>
                        <Input
                            id={`${mode}-webhook-name`}
                            name="name"
                            defaultValue={initialValue.name}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${mode}-webhook-url`}>
                            {t("fields.url")}
                        </Label>
                        <Input
                            id={`${mode}-webhook-url`}
                            name="url"
                            type="url"
                            defaultValue={initialValue.url}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("fields.metric")}</Label>
                        <select
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            value={metric}
                            onChange={(event) =>
                                setMetric(event.target.value as MetricType)
                            }
                        >
                            {metricOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <input type="hidden" name="metric" value={metric} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("fields.comparator")}</Label>
                        <select
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            value={comparator}
                            onChange={(event) => setComparator(event.target.value)}
                        >
                            {comparatorOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <input
                            type="hidden"
                            name="comparator"
                            value={comparator}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${mode}-webhook-threshold`}>
                            {t("fields.threshold")}
                        </Label>
                        <Input
                            id={`${mode}-webhook-threshold`}
                            name="threshold"
                            type="number"
                            step="0.1"
                            defaultValue={initialValue.threshold}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${mode}-webhook-cooldown`}>
                            {t("fields.cooldown")}
                        </Label>
                        <Input
                            id={`${mode}-webhook-cooldown`}
                            name="cooldownSec"
                            type="number"
                            defaultValue={initialValue.cooldownSec}
                        />
                    </div>
                    <div className="flex items-center gap-2 md:col-span-2">
                        <Switch
                            id={`${mode}-webhook-active`}
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                        <Label htmlFor={`${mode}-webhook-active`}>
                            {t("fields.active")}
                        </Label>
                        <input
                            type="hidden"
                            name="isActive"
                            value={isActive ? "true" : "false"}
                        />
                    </div>
                    <DialogFooter className="md:col-span-2">
                        <SubmitButton
                            label={
                                mode === "create"
                                    ? t("submit.label")
                                    : t("submit.editLabel")
                            }
                            icon={
                                mode === "create" ? (
                                    <CirclePlusIcon className="size-4" />
                                ) : (
                                    <PencilIcon className="size-4" />
                                )
                            }
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function SubmitButton({label, icon}: {label: string; icon: ReactNode}) {
    const {pending} = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {icon}
            {label}
        </Button>
    )
}
