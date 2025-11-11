import React from 'react';
import {TERRARIUM_ACTION_LABELS, TERRARIUM_ACTION_VISUALS} from "@/constants/terrarium-actions";
import {cn, timeAgoInWords} from "@/lib/utils";
import type {TerrariumActionEntry} from "@/types/terrarium";

type Props = {
    action: TerrariumActionEntry
    isLast: boolean
    dateFormatter: Intl.DateTimeFormat
}

const ActionTimelineItem = ({action, isLast, dateFormatter}: Props) => {
    const visuals = TERRARIUM_ACTION_VISUALS[action.type]
    const Icon = visuals.icon
    const performedAt = new Date(action.performedAt)

    return (
        <li className="flex gap-4">
            <div className="flex flex-col items-center">
                <div
                    className={cn(
                        "flex size-9 items-center justify-center rounded-full border text-sm font-semibold shadow-sm",
                        visuals.accentClassName
                    )}
                >
                    <Icon className="size-4"/>
                </div>
                {!isLast && (
                    <span className="mt-2 w-px flex-1 bg-border"/>
                )}
            </div>
            <div className="flex-1 rounded-lg border bg-background/70 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                        {TERRARIUM_ACTION_LABELS[action.type]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {timeAgoInWords(performedAt)}
                    </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {action.notes}
                </p>
                <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                    {dateFormatter.format(performedAt)}
                </div>
            </div>
        </li>
    )
};

export default ActionTimelineItem;