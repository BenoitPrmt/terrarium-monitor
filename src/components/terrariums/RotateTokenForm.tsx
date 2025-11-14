"use client"

import React, {useActionState, useEffect, useState} from "react"
import {useFormStatus} from "react-dom"

import {updateTerrariumAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {toast} from "sonner"
import {Loader2Icon, RotateCcwKeyIcon} from "lucide-react";
import {useTranslations} from "next-intl";

type Props = {
    terrariumId: string
}

type ActionState = Awaited<ReturnType<typeof updateTerrariumAction>>

const initialState: ActionState | null = null

export function RotateTokenForm({terrariumId}: Props) {
    const action = async (_state: ActionState | null, formData: FormData) => {
        formData.set("regenerateToken", "true")
        return updateTerrariumAction(terrariumId, formData)
    }

    const [state, formAction] = useActionState<ActionState | null, FormData>(
        action,
        initialState
    )
    const [copied, setCopied] = useState(false)
    const t = useTranslations('Terrariums.token');
    const common = useTranslations('Common');

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
        <div className="space-y-4">
            <form action={formAction}>
                <RotateButton/>
            </form>
            {token && (
                <Alert>
                    <AlertTitle>{t('title')}</AlertTitle>
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
                            {copied ? common('actions.copied') : common('actions.copy')}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}

function RotateButton() {
    const {pending} = useFormStatus()
    const t = useTranslations('Terrariums.token');
    return (
        <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? (
                <>
                    <Loader2Icon className="size-4 animate-spin" />
                    {t('pending')}
                </>
            ) : (
                <>
                    <RotateCcwKeyIcon className="size-4" />
                    {t('cta')}
                </>
            )}
        </Button>
    )
}
