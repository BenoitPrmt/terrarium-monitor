"use client"

import {useActionState, useEffect, useState} from "react"
import {useFormStatus} from "react-dom"
import {updateTerrariumAction} from "@/app/(dashboard)/dashboard/actions"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    TERRARIUM_LOCATIONS,
    type TerrariumLocationValue,
} from "@/constants/terrarium-locations"
import {getLocationIcon} from "@/components/terrariums/locationIcons"
import SaveSubmitButton from "@/components/form/SaveSubmitButton";
import {toast} from "sonner"

type Props = {
    terrariumId: string
    name: string
    location?: string | null
    description?: string | null
}

type ActionState = Awaited<ReturnType<typeof updateTerrariumAction>>

const initialState: ActionState | null = null

export function TerrariumSettingsForm({
                                          terrariumId,
                                          name,
                                          location,
                                          description,
                                      }: Props) {
    const {pending} = useFormStatus()
    const action = async (_state: ActionState | null, formData: FormData) => {
        return updateTerrariumAction(terrariumId, formData)
    }

    const [state, formAction] = useActionState<ActionState | null, FormData>(
        action,
        initialState
    )
    const [selectedLocation, setSelectedLocation] = useState<TerrariumLocationValue>(
        (location as TerrariumLocationValue) || "other"
    )
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

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" defaultValue={name} required/>
            </div>
            <div className="space-y-2">
                <Label>Emplacement</Label>
                <Select
                    value={selectedLocation}
                    onValueChange={(value) =>
                        setSelectedLocation(value as TerrariumLocationValue)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Choisir un emplacement"/>
                    </SelectTrigger>
                    <SelectContent>
                        {TERRARIUM_LOCATIONS.map((option) => {
                            const Icon = getLocationIcon(option.value)
                            return (
                                <SelectItem key={option.value} value={option.value}>
                                    <span className="flex items-center gap-2">
                                        <Icon className="size-4"/>
                                        {option.label}
                                    </span>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
                <input type="hidden" name="location" value={selectedLocation}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={description ?? ""}
                    rows={4}
                />
            </div>
            <SaveSubmitButton pending={pending}/>
        </form>
    )
}

