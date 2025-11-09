import React from 'react';
import {Button} from "@/components/ui/button";
import {Loader2Icon, SaveIcon} from "lucide-react";

type Props = {
    pending: boolean
}

const SaveSubmitButton = ({ pending }: Props) => {
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Enregistrement...
                </>
            ) : (
                <>
                    <SaveIcon className="size-4" />
                    Enregistrer
                </>
            )}
        </Button>
    )
};

export default SaveSubmitButton;