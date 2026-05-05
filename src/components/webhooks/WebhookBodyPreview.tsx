"use client"

import {CopyButton} from "@/components/ui/copy-button"
import {cn} from "@/lib/utils"

type WebhookBodyPreviewProps = {
    title: string
    description?: string
    payload: Record<string, unknown>
    className?: string
}

export function WebhookBodyPreview({
    title,
    description,
    payload,
    className,
}: WebhookBodyPreviewProps) {
    const body = JSON.stringify(payload, null, 2)

    return (
        <div className={cn("overflow-hidden rounded-md border bg-muted/30", className)}>
            <div className="flex items-start justify-between gap-3 border-b px-3 py-2">
                <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">{title}</p>
                    {description && (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <CopyButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    content={body}
                    aria-label={title}
                />
            </div>
            <pre className="max-h-72 overflow-auto p-3 text-xs leading-relaxed">
                <code>{body}</code>
            </pre>
        </div>
    )
}
