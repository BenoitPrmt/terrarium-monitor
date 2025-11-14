import {MetricStatCard} from "@/components/terrariums/MetricStatCard"
import type {MetricSnapshot} from "@/lib/services/metrics"
import type {MetricType} from "@/models/constants"
import type {MetricDisplayConfig} from "@/types/metrics"
import {getTranslations, getLocale} from "next-intl/server";

type MetricSnapshotGridProps = {
    configs: MetricDisplayConfig[]
    snapshots: Partial<Record<MetricType, MetricSnapshot>>
}

export async function MetricSnapshotGrid({configs, snapshots}: MetricSnapshotGridProps) {
    const metricsT = await getTranslations('Common.metrics');
    const locale = await getLocale();

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {configs.map((config) => (
                <MetricStatCard
                    key={config.key}
                    label={metricsT(config.labelKey)}
                    unitLabel={config.unitLabel}
                    icon={config.icon}
                    accentClassName={config.accentClassName}
                    snapshot={snapshots[config.key]}
                    locale={locale}
                />
            ))}
        </div>
    )
}
