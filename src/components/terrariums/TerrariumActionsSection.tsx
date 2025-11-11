"use client"

import {useActionState, useEffect, useMemo, useRef, useState} from "react"
import {useFormStatus} from "react-dom"
import {logTerrariumCareAction} from "@/app/(dashboard)/dashboard/actions"
import {
    TERRARIUM_ACTION_OPTIONS,
} from "@/constants/terrarium-actions"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import type {TerrariumActionEntry} from "@/types/terrarium"
import {toast} from "sonner"
import SaveSubmitButton from "@/components/form/SaveSubmitButton";
import {CirclePlusIcon} from "lucide-react";
import ActionTimeline from "@/components/terrariums/actions/ActionTimeline";

type ActionState = Awaited<ReturnType<typeof logTerrariumCareAction>>

const initialState: ActionState | null = null

type TerrariumActionsSectionProps = {
    terrariumId: string
    actions: TerrariumActionEntry[]
}

export function TerrariumActionsSection({
                                            terrariumId,
                                            actions,
                                        }: TerrariumActionsSectionProps) {
    const {pending} = useFormStatus();
    const formRef = useRef<HTMLFormElement | null>(null)
    const [visibleCount, setVisibleCount] = useState(() =>
        Math.min(actions.length, 8)
    )

    useEffect(() => {
        setVisibleCount((prev) => {
            const baseline = Math.max(prev, 8)
            return Math.min(baseline, actions.length)
        })
    }, [actions.length])

    const action = async (_state: ActionState | null, formData: FormData) => {
        return logTerrariumCareAction(terrariumId, formData)
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
            formRef.current?.reset()
        } else {
            toast.error(state.message)
        }
    }, [state])

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        []
    )

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Actions récentes</CardTitle>
                <CardDescription>
                    Gardez un historique des soins apportés à ce terrarium.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form ref={formRef} action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type d&apos;action</Label>
                        <select
                            id="type"
                            name="type"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            defaultValue={TERRARIUM_ACTION_OPTIONS[0]?.value}
                            required
                        >
                            {TERRARIUM_ACTION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Ex: Arrosage léger ce matin."
                            minLength={3}
                            maxLength={500}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <SaveSubmitButton
                            pending={pending}
                            label="Ajouter"
                            icon={<CirclePlusIcon className="size-4"/>}
                        />
                    </div>
                </form>
                <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">
                        Journal des actions
                    </div>
                    <ActionTimeline
                        actions={actions.slice(0, visibleCount)}
                        dateFormatter={dateFormatter}
                    />
                    {actions.length > visibleCount && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                                setVisibleCount((prev) =>
                                    Math.min(prev + 8, actions.length)
                                )
                            }
                        >
                            Voir plus
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
