"use client"

import React, {useMemo} from 'react';
import type {TerrariumActionEntry} from "@/types/terrarium";
import ActionTimelineItem from "@/components/terrariums/actions/ActionTimelineItem";
import {useTranslations, useLocale} from "next-intl";

type Props = {
    actions: TerrariumActionEntry[];
    locale?: string;
}

const ActionTimeline = ({actions, locale}: Props) => {
    const t = useTranslations('Terrarium.care');
    const resolvedLocale = locale ?? useLocale();
    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(resolvedLocale, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [resolvedLocale]
    );

    if (actions.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                {t('logEmpty')}
            </div>
        )
    }

    return (
        <ol className="space-y-6">
            {actions.map((action, index) => (
                <ActionTimelineItem
                    key={action.id}
                    action={action}
                    isLast={index === actions.length - 1}
                    dateFormatter={dateFormatter}
                />
            ))}
        </ol>
    )
};

export default ActionTimeline;
