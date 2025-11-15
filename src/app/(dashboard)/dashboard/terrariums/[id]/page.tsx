import {redirect} from "next/navigation";
import {currentUser} from "@/auth/current-user";
import {
    CHART_GRANULARITIES,
    CHART_GRANULARITY_OPTIONS,
    CHART_RANGE_OPTIONS,
    DEFAULT_METRIC_KEY,
    DEFAULT_SECONDARY_METRIC_KEY,
    METRIC_DISPLAY_CONFIGS,
    METRIC_DISPLAY_CONFIG_MAP,
    METRIC_RANGE_MAP,
} from "@/constants/metrics";
import {ensureDbIndexes} from "@/lib/db/ensureIndexes";
import {connectMongoose} from "@/lib/db/mongoose";
import {buildHourOfDaySeries, buildSeriesByMetricAndGranularity} from "@/lib/metrics/series";
import {getAggregates, getMetricSnapshots} from "@/lib/services/metrics";
import {listTerrariumActions} from "@/lib/services/terrariumActions";
import {
    requireTerrariumForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums";
import {SampleModel} from "@/models/Sample";
import type {AggregateGranularity, MetricType} from "@/models/constants";
import type {GranularityDataset, RecentSample} from "@/types/metrics";
import {HourOfDaySection} from "@/components/terrariums/charts/HourOfDaySection";
import {MetricSeriesSection} from "@/components/terrariums/charts/MetricSeriesSection";
import {MetricSnapshotGrid} from "@/components/terrariums/MetricSnapshotGrid";
import {RecentSamplesSection} from "@/components/terrariums/RecentSamplesSection";
import {TerrariumHeader} from "@/components/terrariums/TerrariumHeader";
import {TerrariumActionsSection} from "@/components/terrariums/TerrariumActionsSection";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{id: string}>
    searchParams: {
        granularity?: AggregateGranularity
        range?: string
        metric?: MetricType
        hourOfDayMetric?: MetricType
    }
}

export default async function TerrariumDetailPage({params, searchParams}: PageProps) {
    const user = await currentUser()
    if (!user) {
        redirect("/login")
    }

    const {id} = await params

    await connectMongoose()
    await ensureDbIndexes()

    const rangeKey =
        searchParams.range && METRIC_RANGE_MAP[searchParams.range]
            ? searchParams.range
            : "24h"

    const granularityParam = searchParams.granularity
    const isGranularityValue = (
        value: unknown
    ): value is AggregateGranularity =>
        typeof value === "string" &&
        CHART_GRANULARITIES.includes(value as AggregateGranularity)

    const defaultGranularityForRange: AggregateGranularity =
        rangeKey === "24h" ? "raw" : "hourly"
    const requestedGranularity: AggregateGranularity = isGranularityValue(granularityParam)
        ? granularityParam
        : defaultGranularityForRange
    const initialGranularity: AggregateGranularity =
        rangeKey === "24h" || requestedGranularity !== "raw"
            ? requestedGranularity
            : "hourly"

    const metricParam = searchParams.metric
    const hourOfDayMetricParam = searchParams.hourOfDayMetric

    const isMetricKey = (value: unknown): value is MetricType =>
        typeof value === "string" &&
        METRIC_DISPLAY_CONFIGS.some((config) => config.key === value)

    const initialMetric = isMetricKey(metricParam)
        ? metricParam
        : DEFAULT_METRIC_KEY

    const initialHourOfDayMetric = isMetricKey(hourOfDayMetricParam)
        ? hourOfDayMetricParam
        : DEFAULT_SECONDARY_METRIC_KEY

    const to = new Date();
    const granularityRangeHours: Record<AggregateGranularity, number> = {
        raw: METRIC_RANGE_MAP["24h"],
        hourly: METRIC_RANGE_MAP["30d"],
        daily: METRIC_RANGE_MAP["30d"],
        byHourOfDay: METRIC_RANGE_MAP["30d"],
    };
    const granularityLimits: Record<AggregateGranularity, number> = {
        raw: 5000,
        hourly: 2000,
        daily: 2000,
        byHourOfDay: 2000,
    };

    const terrariumDoc = await requireTerrariumForOwner(id, user.id)
    const terrarium = serializeTerrarium(terrariumDoc)

    const metricSnapshots = await getMetricSnapshots(
        terrariumDoc._id,
        METRIC_DISPLAY_CONFIGS.map((config) => config.key)
    )

    const granularityDatasets: GranularityDataset[] = await Promise.all(
        CHART_GRANULARITIES.map(async (granularity) => {
            const rangeHours = granularityRangeHours[granularity] ?? METRIC_RANGE_MAP["30d"]
            const from = new Date(to.getTime() - rangeHours * 60 * 60 * 1000)
            const datasets = await Promise.all(
                METRIC_DISPLAY_CONFIGS.map((metric) =>
                    getAggregates({
                        terrariumId: terrariumDoc._id,
                        type: metric.key,
                        granularity,
                        from,
                        to,
                        limit: granularityLimits[granularity],
                    })
                )
            )
            return {granularity, datasets}
        })
    )

    const metricSeriesData = buildSeriesByMetricAndGranularity(
        METRIC_DISPLAY_CONFIGS,
        granularityDatasets
    )

    const hodRawData = await Promise.all(
        METRIC_DISPLAY_CONFIGS.map((metric) =>
            getAggregates({
                terrariumId: terrariumDoc._id,
                type: metric.key,
                granularity: "byHourOfDay",
            })
        )
    )

    const hourOfDayDatasets = buildHourOfDaySeries(
        METRIC_DISPLAY_CONFIGS,
        hodRawData as Array<Array<{hourOfDay: number; avg: number}>>
    )

    const recentSamples = await SampleModel.find({
        terrariumId: terrariumDoc._id,
    })
        .sort({ts: -1})
        .limit(20)
        .lean<RecentSample[]>()

    const terrariumActions = await listTerrariumActions(terrariumDoc._id)

    return (
        <div className="space-y-6">
            <TerrariumHeader terrarium={terrarium}/>
            <MetricSnapshotGrid configs={METRIC_DISPLAY_CONFIGS} snapshots={metricSnapshots}/>

            <MetricSeriesSection
                metricSeriesData={metricSeriesData}
                configs={METRIC_DISPLAY_CONFIGS}
                granularityOptions={CHART_GRANULARITY_OPTIONS}
                rangeOptions={CHART_RANGE_OPTIONS}
                initialMetric={initialMetric}
                initialGranularity={initialGranularity}
                initialRange={rangeKey}
                requestedAt={to.toISOString()}
            />
            <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                <TerrariumActionsSection
                    terrariumId={terrarium.id}
                    actions={terrariumActions}
                />
                <div className="space-y-6">
                    <HourOfDaySection
                        datasets={hourOfDayDatasets}
                        configs={METRIC_DISPLAY_CONFIGS}
                        initialMetric={initialHourOfDayMetric}
                    />
                    <RecentSamplesSection
                        samples={recentSamples}
                        configMap={METRIC_DISPLAY_CONFIG_MAP}
                    />
                </div>
            </div>
        </div>
    )
}
