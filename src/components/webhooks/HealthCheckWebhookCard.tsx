"use client"

import {useActionState, useEffect, useState} from "react"
import {useFormStatus} from "react-dom"

import {updateHealthCheckWebhookAction} from "@/app/(dashboard)/dashboard/actions"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import SaveSubmitButton from "@/components/form/SaveSubmitButton"
import {Badge} from "@/components/ui/badge"
import {useLocale, useTranslations} from "next-intl"
import {toast} from "sonner"

type HealthCheckConfig = {
    url: string
    delayMinutes: number
    isEnabled: boolean
    lastTriggeredAt?: string | null
    secretId?: string
}

type Props = {
    terrariumId: string
    config: HealthCheckConfig
}

type ActionState = Awaited<
    ReturnType<typeof updateHealthCheckWebhookAction>
>

const initialState: ActionState | null = null

export function HealthCheckWebhookCard({terrariumId, config}: Props) {
    const locale = useLocale()
    const t = useTranslations("Webhooks.healthCheck")

    const [state, formAction] = useActionState<ActionState | null, FormData>(
        async (_state, formData) => {
            return updateHealthCheckWebhookAction(terrariumId, formData)
        },
        initialState
    )
    const [localConfig, setLocalConfig] = useState(config)

    useEffect(() => {
        if (!state?.message) {
            return
        }
        if (state.success) {
            const nextConfig = state.data as HealthCheckConfig | undefined
            if (nextConfig) {
                setLocalConfig(nextConfig)
            }
            toast.success(state.message)
        } else {
            toast.error(state.message)
        }
    }, [state])

    const formatter = new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    })

    return (
        <div className="space-y-4">
            <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="healthcheck-url">
                        {t("fields.url")}
                    </Label>
                    <Input
                        id="healthcheck-url"
                        name="url"
                        type="url"
                        placeholder="https://example.com/webhook"
                        defaultValue={localConfig.url}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="healthcheck-delay">
                        {t("fields.delay")}
                    </Label>
                    <Input
                        id="healthcheck-delay"
                        name="delayMinutes"
                        type="number"
                        min={5}
                        defaultValue={localConfig.delayMinutes}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="healthcheck-enabled"
                            checked={localConfig.isEnabled}
                            onCheckedChange={(checked) =>
                                setLocalConfig((previous) => ({
                                    ...previous,
                                    isEnabled: checked,
                                }))
                            }
                        />
                        <Label htmlFor="healthcheck-enabled">
                            {t("fields.enabled")}
                        </Label>
                        <input
                            type="hidden"
                            name="isEnabled"
                            value={
                                localConfig.isEnabled ? "true" : "false"
                            }
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t("helper")}
                    </p>
                </div>
                <SubmitButton />
            </form>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {localConfig.secretId && (
                    <Badge variant="default">
                        {t("secretLabel", {id: localConfig.secretId})}
                    </Badge>
                )}
                {localConfig.lastTriggeredAt && (
                    <span>
                        {t("lastTriggered", {
                            date: formatter.format(
                                new Date(localConfig.lastTriggeredAt)
                            ),
                        })}
                    </span>
                )}
            </div>
        </div>
    )
}

function SubmitButton() {
    const {pending} = useFormStatus()
    return <SaveSubmitButton pending={pending} />
}
