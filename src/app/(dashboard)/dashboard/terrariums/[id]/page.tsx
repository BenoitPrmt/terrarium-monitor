import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {
    CHART_GRANULARITIES,
    CHART_GRANULARITY_OPTIONS,
    CHART_RANGE_OPTIONS,
    DEFAULT_METRIC_KEY,
    DEFAULT_SECONDARY_METRIC_KEY,
    METRIC_DISPLAY_CONFIGS,
    METRIC_DISPLAY_CONFIG_MAP,
    METRIC_RANGE_MAP,
} from "@/constants/metrics"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {buildHourOfDaySeries, buildSeriesByMetricAndGranularity} from "@/lib/metrics/series"
import {getAggregates, getMetricSnapshots} from "@/lib/services/metrics"
import {listTerrariumActions} from "@/lib/services/terrariumActions"
import {
    requireTerrariumForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums"
import {SampleModel} from "@/models/Sample"
import type {AggregateGranularity, MetricType} from "@/models/constants"
import type {GranularityDataset, RecentSample} from "@/types/metrics"

import {HourOfDaySection} from "../../../../../components/terrariums/charts/HourOfDaySection"
import {MetricSeriesSection} from "../../../../../components/terrariums/charts/MetricSeriesSection"
import {MetricSnapshotGrid} from "../../../../../components/terrariums/MetricSnapshotGrid"
import {RecentSamplesSection} from "../../../../../components/terrariums/RecentSamplesSection"
import {TerrariumHeader} from "../../../../../components/terrariums/TerrariumHeader"
import {TerrariumActionsSection} from "../../../../../components/terrariums/TerrariumActionsSection"

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

    const granularityParam = searchParams.granularity
    const initialGranularity: AggregateGranularity =
        granularityParam && CHART_GRANULARITIES.includes(granularityParam as AggregateGranularity)
            ? (granularityParam as AggregateGranularity)
            : "raw"

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

    const rangeKey =
        searchParams.range && METRIC_RANGE_MAP[searchParams.range]
            ? searchParams.range
            : "24h"

    const hours = METRIC_RANGE_MAP[rangeKey]
    const to = new Date()
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000)

    const terrariumDoc = await requireTerrariumForOwner(id, user.id)
    const terrarium = serializeTerrarium(terrariumDoc)

    const metricSnapshots = await getMetricSnapshots(
        terrariumDoc._id,
        METRIC_DISPLAY_CONFIGS.map((config) => config.key)
    )

    const granularityDatasets: GranularityDataset[] = await Promise.all(
        CHART_GRANULARITIES.map(async (granularity) => {
            const datasets = await Promise.all(
                METRIC_DISPLAY_CONFIGS.map((metric) =>
                    getAggregates({
                        terrariumId: terrariumDoc._id,
                        type: metric.key,
                        granularity,
                        from,
                        to,
                        limit: 500,
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
