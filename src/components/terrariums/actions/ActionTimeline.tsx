import React from 'react';
import type {TerrariumActionEntry} from "@/types/terrarium";
import ActionTimelineItem from "@/components/terrariums/actions/ActionTimelineItem";

type Props = {
    actions: TerrariumActionEntry[];
    dateFormatter: Intl.DateTimeFormat;
}
const ActionTimeline = ({actions, dateFormatter}: Props) => {
    if (actions.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Aucune action n&apos;a encore été enregistrée.
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