"use client"

import {useActionState, useEffect} from "react";
import {useFormStatus} from "react-dom";
import {createWebhookAction} from "@/app/(dashboard)/dashboard/actions";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {useTranslations} from "next-intl";
import SaveSubmitButton from "@/components/form/SaveSubmitButton";
import {CirclePlusIcon} from "lucide-react";

const comparatorOptions = [
    {value: "gt", label: ">"},
    {value: "gte", label: ">="},
    {value: "lt", label: "<"},
    {value: "lte", label: "<="},
]

type ActionState = Awaited<ReturnType<typeof createWebhookAction>>;

const initialState: ActionState | null = null;

export function NewWebhookForm({terrariumId}: { terrariumId: string }) {
    const action = async (_state: ActionState | null, formData: FormData) => {
        return createWebhookAction(terrariumId, formData)
    };

    const {pending} = useFormStatus();
    const [state, formAction] = useActionState<ActionState | null, FormData>(
        action,
        initialState
    );
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

    const t = useTranslations('Webhooks.form');
    const metricsT = useTranslations('Common.metrics');
    const metricOptions = [
        {value: "TEMPERATURE", label: metricsT('temperature')},
        {value: "HUMIDITY", label: metricsT('humidity')},
        {value: "PRESSURE", label: metricsT('pressure')},
        {value: "ALTITUDE", label: metricsT('altitude')},
    ];

    return (
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="name">{t('fields.name')}</Label>
                <Input id="name" name="name" required/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="url">{t('fields.url')}</Label>
                <Input id="url" name="url" type="url" required/>
            </div>
            <div className="space-y-2">
                <Label>{t('fields.metric')}</Label>
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
                <Label>{t('fields.comparator')}</Label>
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
                <Label htmlFor="threshold">{t('fields.threshold')}</Label>
                <Input id="threshold" name="threshold" type="number" step="0.1" required/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="cooldownSec">{t('fields.cooldown')}</Label>
                <Input id="cooldownSec" name="cooldownSec" type="number" defaultValue={900}/>
            </div>
            <div className="md:col-span-2">
                <SaveSubmitButton
                    pending={pending}
                    label={t('submit.label')}
                    pendingLabel={t('submit.label')}
                    icon={<CirclePlusIcon className="size-4"/>}
                />
            </div>
        </form>
    )
}
