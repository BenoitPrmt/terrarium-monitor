import React from 'react';
import {Button} from "@/components/ui/button";
import {Loader2Icon, SaveIcon} from "lucide-react";

type Props = {
    pending: boolean;
    label?: string;
    icon?: React.ReactNode;
    pendingLabel?: string;
    pendingIcon?: React.ReactNode;
}

const SaveSubmitButton = ({
                              pending,
                              label = "Enregistrer",
                              icon = <SaveIcon className="size-4"/>,
                              pendingLabel = "Enregistrement...",
                              pendingIcon = <Loader2Icon className="size-4 animate-spin"/>
                          }: Props) => {
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    {pendingIcon}
                    {pendingLabel}
                </>
            ) : (
                <>
                    {icon}
                    {label}
                </>
            )}
        </Button>
    )
};

export default SaveSubmitButton;