"use client"

import {type ReactNode, useState, useTransition} from "react"
import {Loader2Icon, PowerIcon, Trash2Icon} from "lucide-react"
import {toast} from "sonner"
import {useTranslations} from "next-intl"

import {
    deleteWebhookAction,
    updateWebhookAction,
} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Props = {
    terrariumId: string
    webhookId: string
    webhookName: string
    isActive: boolean
    trigger: ReactNode
}

export function WebhookDeleteDialog({
    terrariumId,
    webhookId,
    webhookName,
    isActive,
    trigger,
}: Props) {
    const t = useTranslations("Webhooks.deleteDialog")
    const [open, setOpen] = useState(false)
    const [pending, startTransition] = useTransition()

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("title", {name: webhookName})}</AlertDialogTitle>
                    <AlertDialogDescription>{t("description")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    {isActive && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={pending}
                            onClick={() =>
                                startTransition(async () => {
                                    const formData = new FormData()
                                    formData.set("isActive", "false")
                                    const result = await updateWebhookAction(
                                        terrariumId,
                                        webhookId,
                                        formData
                                    )

                                    if (result.success) {
                                        toast.success(result.message)
                                        setOpen(false)
                                    } else {
                                        toast.error(result.message)
                                    }
                                })
                            }
                        >
                            {pending ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                                <PowerIcon className="size-4" />
                            )}
                            {t("disable")}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={pending}
                        onClick={() =>
                            startTransition(async () => {
                                const result = await deleteWebhookAction(
                                    terrariumId,
                                    webhookId
                                )

                                if (result.success) {
                                    toast.success(result.message)
                                    setOpen(false)
                                } else {
                                    toast.error(result.message)
                                }
                            })
                        }
                    >
                        {pending ? (
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <Trash2Icon className="size-4" />
                        )}
                        {t("delete")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
