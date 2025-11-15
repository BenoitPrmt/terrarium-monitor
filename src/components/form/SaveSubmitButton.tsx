"use client"

import React from 'react';
import {Button} from "@/components/ui/button";
import {Loader2Icon, SaveIcon} from "lucide-react";
import {useTranslations} from "next-intl";

type Props = {
    pending: boolean;
    label?: string;
    icon?: React.ReactNode;
    pendingLabel?: string;
    pendingIcon?: React.ReactNode;
}

const SaveSubmitButton = ({
                              pending,
                              label,
                              icon = <SaveIcon className="size-4"/>,
                              pendingLabel,
                              pendingIcon = <Loader2Icon className="size-4 animate-spin"/>
                          }: Props) => {
    const t = useTranslations('Forms.saveButton');
    const resolvedLabel = label ?? t('label');
    const resolvedPendingLabel = pendingLabel ?? t('pending');

    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    {pendingIcon}
                    {resolvedPendingLabel}
                </>
            ) : (
                <>
                    {icon}
                    {resolvedLabel}
                </>
            )}
        </Button>
    )
};

export default SaveSubmitButton;
