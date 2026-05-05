"use client"

import {type ReactNode, useActionState, useEffect, useState} from "react"
import {useFormStatus} from "react-dom"
import {CirclePlusIcon, PencilIcon, Trash2Icon} from "lucide-react"
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
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Textarea} from "@/components/ui/textarea"
import {WebhookBodyPreview} from "@/components/webhooks/WebhookBodyPreview"
import {
    buildWebhookPayload,
    createExampleWebhookContext,
    DEFAULT_DISCORD_BODY_CONFIG,
    DEFAULT_CUSTOM_BODY_TEMPLATE,
    normalizeDiscordBodyConfig,
    type DiscordBodyConfig,
    type DiscordBodyConfigInput,
    type WebhookBodyPreset,
} from "@/lib/utils/webhook-payload"
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
    bodyPreset?: WebhookBodyPreset
    discordBodyConfig?: DiscordBodyConfigInput
    customBodyTemplate?: string
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
    bodyPreset: "default",
    discordBodyConfig: DEFAULT_DISCORD_BODY_CONFIG,
    customBodyTemplate: DEFAULT_CUSTOM_BODY_TEMPLATE,
}

export function WebhookFormDialog({terrariumId, mode, webhook, trigger}: Props) {
    const t = useTranslations("Webhooks.form")
    const metricsT = useTranslations("Common.metrics")
    const [open, setOpen] = useState(false)
    const initialValue = webhook ?? defaults
    const [metric, setMetric] = useState<MetricType>(initialValue.metric)
    const [comparator, setComparator] = useState(initialValue.comparator)
    const [isActive, setIsActive] = useState(initialValue.isActive)
    const [bodyPreset, setBodyPreset] = useState<WebhookBodyPreset>(
        initialValue.bodyPreset ?? "default"
    )
    const [discordBodyConfig, setDiscordBodyConfig] = useState<DiscordBodyConfig>(
        normalizeDiscordBodyConfig(initialValue.discordBodyConfig)
    )
    const [customBodyTemplate, setCustomBodyTemplate] = useState(
        initialValue.customBodyTemplate || DEFAULT_CUSTOM_BODY_TEMPLATE
    )

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
        setBodyPreset(next.bodyPreset ?? "default")
        setDiscordBodyConfig(normalizeDiscordBodyConfig(next.discordBodyConfig))
        setCustomBodyTemplate(
            next.customBodyTemplate || DEFAULT_CUSTOM_BODY_TEMPLATE
        )
    }, [open, webhook])

    const metricOptions = [
        {value: "TEMPERATURE", label: metricsT("temperature")},
        {value: "HUMIDITY", label: metricsT("humidity")},
        {value: "PRESSURE", label: metricsT("pressure")},
        {value: "ALTITUDE", label: metricsT("altitude")},
    ]
    let previewPayload: Record<string, unknown>
    try {
        previewPayload = buildWebhookPayload(
            {bodyPreset, discordBodyConfig, customBodyTemplate},
            createExampleWebhookContext({
                metric,
                comparator,
                threshold: Number(initialValue.threshold),
            })
        )
    } catch {
        previewPayload = {error: t("body.invalidJson")}
    }

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
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-2xl">
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
                <form
                    action={formAction}
                    className="grid max-h-[calc(100vh-10rem)] gap-4 overflow-y-auto pr-1 md:grid-cols-2"
                >
                    <div className="space-y-2">
                        <Label htmlFor={`${mode}-webhook-name`}>
                            {t("fields.name")}
                        </Label>
                        <Input
                            id={`${mode}-webhook-name`}
                            name="name"
                            placeholder={t("fields.name")}
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
                            placeholder={t("fields.url")}
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
                    <div className="space-y-3 rounded-lg border p-3 md:col-span-2">
                        <div>
                            <Label>{t("body.title")}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t("body.description")}
                            </p>
                        </div>
                        <Tabs
                            value={bodyPreset}
                            onValueChange={(value) =>
                                setBodyPreset(value as WebhookBodyPreset)
                            }
                        >
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="default">
                                    {t("body.presets.default")}
                                </TabsTrigger>
                                <TabsTrigger value="discord">
                                    {t("body.presets.discord")}
                                </TabsTrigger>
                                <TabsTrigger value="custom">
                                    {t("body.presets.custom")}
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="default" className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    {t("body.defaultHelp")}
                                </p>
                            </TabsContent>
                            <TabsContent value="discord" className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    {t("body.discordHelp")}
                                </p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor={`${mode}-discord-content`}>
                                            {t("body.discord.content")}
                                        </Label>
                                        <Input
                                            id={`${mode}-discord-content`}
                                            value={discordBodyConfig.content}
                                            onChange={(event) =>
                                                setDiscordBodyConfig((previous) => ({
                                                    ...previous,
                                                    content: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`${mode}-discord-title`}>
                                            {t("body.discord.title")}
                                        </Label>
                                        <Input
                                            id={`${mode}-discord-title`}
                                            value={discordBodyConfig.embedTitle}
                                            onChange={(event) =>
                                                setDiscordBodyConfig((previous) => ({
                                                    ...previous,
                                                    embedTitle: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`${mode}-discord-color`}>
                                            {t("body.discord.color")}
                                        </Label>
                                        <Input
                                            id={`${mode}-discord-color`}
                                            type="color"
                                            value={discordBodyConfig.embedColor}
                                            onChange={(event) =>
                                                setDiscordBodyConfig((previous) => ({
                                                    ...previous,
                                                    embedColor: event.target.value,
                                                }))
                                            }
                                            className="h-9 p-1"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor={`${mode}-discord-description`}>
                                            {t("body.discord.description")}
                                        </Label>
                                        <Textarea
                                            id={`${mode}-discord-description`}
                                            value={discordBodyConfig.embedDescription}
                                            onChange={(event) =>
                                                setDiscordBodyConfig((previous) => ({
                                                    ...previous,
                                                    embedDescription: event.target.value,
                                                }))
                                            }
                                            className="min-h-20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label>{t("body.discord.fields")}</Label>
                                    {discordBodyConfig.fields.map((field, index) => (
                                        <div
                                            key={index}
                                            className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_1fr_auto]"
                                        >
                                            <Input
                                                aria-label={t("body.discord.fieldName")}
                                                value={field.name}
                                                onChange={(event) =>
                                                    setDiscordBodyConfig((previous) => ({
                                                        ...previous,
                                                        fields: previous.fields.map(
                                                            (item, fieldIndex) =>
                                                                fieldIndex === index
                                                                    ? {
                                                                          ...item,
                                                                          name: event.target.value,
                                                                      }
                                                                    : item
                                                        ),
                                                    }))
                                                }
                                            />
                                            <Input
                                                aria-label={t("body.discord.fieldValue")}
                                                value={field.value}
                                                onChange={(event) =>
                                                    setDiscordBodyConfig((previous) => ({
                                                        ...previous,
                                                        fields: previous.fields.map(
                                                            (item, fieldIndex) =>
                                                                fieldIndex === index
                                                                    ? {
                                                                          ...item,
                                                                          value: event.target.value,
                                                                      }
                                                                    : item
                                                        ),
                                                    }))
                                                }
                                            />
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`${mode}-discord-field-${index}`}
                                                    checked={field.inline}
                                                    onCheckedChange={(checked) =>
                                                        setDiscordBodyConfig(
                                                            (previous) => ({
                                                                ...previous,
                                                                fields: previous.fields.map(
                                                                    (item, fieldIndex) =>
                                                                        fieldIndex === index
                                                                            ? {
                                                                                  ...item,
                                                                                  inline: checked,
                                                                              }
                                                                            : item
                                                                ),
                                                            })
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`${mode}-discord-field-${index}`}
                                                >
                                                    {t("body.discord.inline")}
                                                </Label>
                                                {discordBodyConfig.fields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={t(
                                                            "body.discord.removeField"
                                                        )}
                                                        onClick={() =>
                                                            setDiscordBodyConfig(
                                                                (previous) => ({
                                                                    ...previous,
                                                                    fields:
                                                                        previous.fields.filter(
                                                                            (_item, fieldIndex) =>
                                                                                fieldIndex !==
                                                                                index
                                                                        ),
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <Trash2Icon className="size-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {discordBodyConfig.fields.length < 5 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setDiscordBodyConfig((previous) => ({
                                                    ...previous,
                                                    fields: [
                                                        ...previous.fields,
                                                        {
                                                            name: t(
                                                                "body.discord.newFieldName"
                                                            ),
                                                            value: "{{current}}",
                                                            inline: true,
                                                        },
                                                    ],
                                                }))
                                            }
                                        >
                                            <CirclePlusIcon className="size-4" />
                                            {t("body.discord.addField")}
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("body.variables")}
                                </p>
                            </TabsContent>
                            <TabsContent value="custom" className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor={`${mode}-custom-body`}>
                                        {t("body.customTemplate")}
                                    </Label>
                                    <Textarea
                                        id={`${mode}-custom-body`}
                                        value={customBodyTemplate}
                                        onChange={(event) =>
                                            setCustomBodyTemplate(event.target.value)
                                        }
                                        className="min-h-44 font-mono text-xs"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("body.variables")}
                                </p>
                            </TabsContent>
                        </Tabs>
                        <input type="hidden" name="bodyPreset" value={bodyPreset} />
                        <input
                            type="hidden"
                            name="discordBodyConfig"
                            value={JSON.stringify(discordBodyConfig)}
                        />
                        <input
                            type="hidden"
                            name="customBodyTemplate"
                            value={customBodyTemplate}
                        />
                        <WebhookBodyPreview
                            title={t("body.previewTitle")}
                            description={t("body.previewDescription")}
                            payload={previewPayload}
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
