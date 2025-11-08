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

type ActionState = Awaited<ReturnType<typeof deleteTerrariumAction>>

const initialState: ActionState = {}

type Props = {
    terrariumId: string
}

export function DeleteTerrariumForm({terrariumId}: Props) {
    const router = useRouter()
    const action = async (_state: ActionState, _formData: FormData) => {
        return deleteTerrariumAction(terrariumId)
    }
    const [state, formAction] = useActionState<ActionState, FormData>(
        action,
        initialState
    )
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (state?.success) {
            router.push("/dashboard")
        }
    }, [state?.success, router])

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
