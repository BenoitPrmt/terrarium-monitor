import {MetricStatCard} from "@/components/terrariums/MetricStatCard"
import type {MetricSnapshot} from "@/lib/services/metrics"
import type {MetricType} from "@/models/constants"
import type {MetricDisplayConfig} from "@/types/metrics"

type MetricSnapshotGridProps = {
    configs: MetricDisplayConfig[]
    snapshots: Partial<Record<MetricType, MetricSnapshot>>
}

export function MetricSnapshotGrid({configs, snapshots}: MetricSnapshotGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {configs.map((config) => (
                <MetricStatCard
                    key={config.key}
                    label={config.label}
                    unitLabel={config.unitLabel}
                    icon={config.icon}
                    accentClassName={config.accentClassName}
                    snapshot={snapshots[config.key]}
                />
            ))}
        </div>
    )
}
