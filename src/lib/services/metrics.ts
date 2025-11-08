import {Types} from "mongoose"

import {AggregateByHourOfDayModel} from "@/models/AggregateByHourOfDay"
import {AggregateDailyModel} from "@/models/AggregateDaily"
import {AggregateHourlyModel} from "@/models/AggregateHourly"
import {SampleModel} from "@/models/Sample"
import type {
    AggregateGranularity,
    MetricType,
} from "@/models/constants"

type AggregateQuery = {
    terrariumId: Types.ObjectId
    type: MetricType
    granularity: AggregateGranularity
    from?: Date
    to?: Date
    limit?: number
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
