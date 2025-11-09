import {Types} from "mongoose"

import {AggregateByHourOfDayModel} from "@/models/AggregateByHourOfDay"
import {AggregateDailyModel} from "@/models/AggregateDaily"
import {AggregateHourlyModel} from "@/models/AggregateHourly"
import {SampleModel} from "@/models/Sample"
import type {
    AggregateGranularity,
    MetricType,
    SampleUnit,
} from "@/models/constants"

type AggregateQuery = {
    terrariumId: Types.ObjectId
    type: MetricType
    granularity: AggregateGranularity
    from?: Date
    to?: Date
    limit?: number
}

export type MetricSnapshot = {
    type: MetricType
    unit: SampleUnit | null
    latestValue: number | null
    lastUpdatedAt: Date | null
    changeOver24h: number | null
}

export async function getMetricSnapshots(
    terrariumId: Types.ObjectId,
    types: MetricType[]
) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const snapshots = await Promise.all(
        types.map(async (type) => {
            const latestSample = await SampleModel.findOne({
                terrariumId,
                type,
            })
                .sort({ts: -1})
                .lean()

            if (!latestSample) {
                return {
                    type,
                    unit: null,
                    latestValue: null,
                    lastUpdatedAt: null,
                    changeOver24h: null,
                } satisfies MetricSnapshot
            }

            const baselineSample =
                (await SampleModel.findOne({
                    terrariumId,
                    type,
                    ts: {$lte: twentyFourHoursAgo},
                })
                    .sort({ts: -1})
                    .lean()) ?? null

            let changeOver24h: number | null = null
            if (baselineSample) {
                changeOver24h = latestSample.value - baselineSample.value
            } else {
                const earliestWindowSample = await SampleModel.findOne({
                    terrariumId,
                    type,
                    ts: {$gte: twentyFourHoursAgo, $lt: latestSample.ts},
                })
                    .sort({ts: 1})
                    .lean()

                if (earliestWindowSample) {
                    changeOver24h =
                        latestSample.value - earliestWindowSample.value
                }
            }

            return {
                type,
                unit: latestSample.unit,
                latestValue: latestSample.value,
                lastUpdatedAt: latestSample.ts,
                changeOver24h,
            } satisfies MetricSnapshot
        })
    )

    return snapshots.reduce<Record<MetricType, MetricSnapshot>>(
        (acc, snapshot) => {
            acc[snapshot.type] = snapshot
            return acc
        },
        {} as Record<MetricType, MetricSnapshot>
    )
}

export async function getAggregates(query: AggregateQuery) {
    const rangeFilter: Record<string, unknown> = {}
    if (query.from) {
        rangeFilter.$gte = query.from
    }
    if (query.to) {
        rangeFilter.$lte = query.to
    }

    const limit = query.limit ?? 500

    if (query.granularity === "raw") {
        const filter: Record<string, unknown> = {
            terrariumId: query.terrariumId,
            type: query.type,
        }
        if (Object.keys(rangeFilter).length) {
            filter.ts = rangeFilter
        }

        const samples = await SampleModel.find(filter)
            .sort({ts: 1})
            .limit(limit)
            .lean()

        return samples.map((sample) => ({
            ts: sample.ts.toISOString(),
            value: sample.value,
            unit: sample.unit,
            type: sample.type,
        }))
    }

    if (query.granularity === "hourly") {
        const filter: Record<string, unknown> = {
            terrariumId: query.terrariumId,
            type: query.type,
        }
        if (Object.keys(rangeFilter).length) {
            filter.hour = rangeFilter
        }

        const aggregates = await AggregateHourlyModel.find(filter)
            .sort({hour: 1})
            .limit(limit)
            .lean()

        return aggregates.map((agg) => ({
            hour: agg.hour.toISOString(),
            avg: agg.avg,
            min: agg.min,
            max: agg.max,
            count: agg.count,
        }))
    }

    if (query.granularity === "daily") {
        const filter: Record<string, unknown> = {
            terrariumId: query.terrariumId,
            type: query.type,
        }
        if (Object.keys(rangeFilter).length) {
            filter.day = rangeFilter
        }

        const aggregates = await AggregateDailyModel.find(filter)
            .sort({day: 1})
            .limit(limit)
            .lean()

        return aggregates.map((agg) => ({
            day: agg.day.toISOString(),
            avg: agg.avg,
            min: agg.min,
            max: agg.max,
            count: agg.count,
        }))
    }

    const aggregates = await AggregateByHourOfDayModel.find({
        terrariumId: query.terrariumId,
        type: query.type,
    })
        .sort({hourOfDay: 1})
        .limit(limit)
        .lean()

    return aggregates.map((agg) => ({
        hourOfDay: agg.hourOfDay,
        avg: agg.avg,
        min: agg.min,
        max: agg.max,
        count: agg.count,
    }))
}
