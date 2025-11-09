import React from 'react';
import {CopyButton} from "@/components/ui/copy-button";

type Props = {
    text: string;
}

const CopyCode = ({ text }: Props) => {
    return (
        <span className="inline-flex items-center gap-1 rounded bg-muted pl-2 max-w-full">
            <code className="text-xs">
                {text}
            </code>
            <CopyButton
                size="sm"
                variant="ghost"
                className="rounded"
                content={text}
            />
        </span>
    );
};

export default CopyCode;
