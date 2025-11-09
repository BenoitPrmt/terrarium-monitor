"use client"

import {useEffect, useState, useActionState} from "react"
import {useRouter} from "next/navigation"

import {deleteTerrariumAction} from "@/app/(dashboard)/dashboard/actions"
import {Button} from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {toast} from "sonner"

type ActionState = Awaited<ReturnType<typeof deleteTerrariumAction>>

const initialState: ActionState | null = null

type Props = {
    terrariumId: string
}

export function DeleteTerrariumForm({terrariumId}: Props) {
    const router = useRouter()
    const action = async (_state: ActionState | null, _formData: FormData) => {
        return deleteTerrariumAction(terrariumId)
    }
    const [state, formAction] = useActionState<ActionState | null, FormData>(
        action,
        initialState
    )
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!state?.message) {
            return
        }
        if (state.success) {
            toast.success(state.message)
            router.push("/dashboard")
        } else {
            toast.error(state.message)
        }
    }, [state, router])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Supprimer le terrarium</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce terrarium ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Toutes les mesures, agrégations et webhooks liés seront supprimés
                        définitivement.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form action={formAction}>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button type="submit" variant="destructive">
                                Confirmer
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
