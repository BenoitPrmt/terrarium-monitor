import {Types} from "mongoose"

import {connectMongoose} from "@/lib/db/mongoose"
import {AggregateByHourOfDayModel} from "@/models/AggregateByHourOfDay"
import {AggregateDailyModel} from "@/models/AggregateDaily"
import {AggregateHourlyModel} from "@/models/AggregateHourly"
import type {MetricType} from "@/models/constants"
import {getHourOfDay, truncateToDay, truncateToHour} from "@/lib/utils/time"

type SampleLike = {
    terrariumId: Types.ObjectId
    type: MetricType
    ts: Date
    value: number
}

type StatBucket = {
    type: MetricType
    keyDate: Date
    count: number
    sum: number
    min: number
    max: number
}

type HourOfDayBucket = {
    type: MetricType
    hourOfDay: number
    count: number
    sum: number
    min: number
    max: number
}

function addToBucket<T extends StatBucket | HourOfDayBucket>(
    bucket: T | undefined,
    value: number
) {
    if (!bucket) {
        throw new Error("Bucket must be initialized before add")
    }

    bucket.count += 1
    bucket.sum += value
    bucket.min = Math.min(bucket.min, value)
    bucket.max = Math.max(bucket.max, value)
}

function createStatBucket(type: MetricType, date: Date): StatBucket {
    return {
        type,
        keyDate: date,
        count: 0,
        sum: 0,
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
    }
}

function createHourOfDayBucket(type: MetricType, hourOfDay: number): HourOfDayBucket {
    return {
        type,
        hourOfDay,
        count: 0,
        sum: 0,
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
    }
}

function mergeStats(
    existing:
        | {
        count: number
        avg: number
        min: number
        max: number
    }
        | null,
    addition: { count: number; sum: number; min: number; max: number }
) {
    if (!addition.count) {
        return existing
    }

    if (!existing) {
        return {
            count: addition.count,
            avg: addition.sum / addition.count,
            min: addition.min,
            max: addition.max,
        }
    }

    const totalCount = existing.count + addition.count
    const totalAvg = (existing.avg * existing.count + addition.sum) / totalCount
    return {
        count: totalCount,
        avg: totalAvg,
        min: Math.min(existing.min, addition.min),
        max: Math.max(existing.max, addition.max),
    }
}

export async function updateAggregatesFromSamples(samples: SampleLike[]) {
    if (!samples.length) {
        return
    }

    await connectMongoose()

    const terrariumId = samples[0].terrariumId

    const hourlyBuckets = new Map<string, StatBucket>()
    const dailyBuckets = new Map<string, StatBucket>()
    const hourOfDayBuckets = new Map<string, HourOfDayBucket>()

    for (const sample of samples) {
        const hour = truncateToHour(sample.ts)
        const day = truncateToDay(sample.ts)
        const hourKey = `${sample.type}-${hour.getTime()}`
        const dayKey = `${sample.type}-${day.getTime()}`
        const hod = getHourOfDay(sample.ts)
        const hodKey = `${sample.type}-${hod}`

        if (!hourlyBuckets.has(hourKey)) {
            hourlyBuckets.set(hourKey, createStatBucket(sample.type, hour))
        }
        addToBucket(hourlyBuckets.get(hourKey), sample.value)

        if (!dailyBuckets.has(dayKey)) {
            dailyBuckets.set(dayKey, createStatBucket(sample.type, day))
        }
        addToBucket(dailyBuckets.get(dayKey), sample.value)

        if (!hourOfDayBuckets.has(hodKey)) {
            hourOfDayBuckets.set(hodKey, createHourOfDayBucket(sample.type, hod))
        }
        addToBucket(hourOfDayBuckets.get(hodKey), sample.value)
    }

    await Promise.all([
        Promise.all(
            Array.from(hourlyBuckets.values()).map(async (bucket) => {
                const existing = await AggregateHourlyModel.findOne({
                    terrariumId,
                    type: bucket.type,
                    hour: bucket.keyDate,
                })

                const merged = mergeStats(existing, bucket)

                if (!merged) {
                    return
                }

                await AggregateHourlyModel.updateOne(
                    {
                        terrariumId,
                        type: bucket.type,
                        hour: bucket.keyDate,
                    },
                    {
                        $set: {
                            terrariumId,
                            type: bucket.type,
                            hour: bucket.keyDate,
                            avg: merged.avg,
                            min: merged.min,
                            max: merged.max,
                            count: merged.count,
                        },
                    },
                    {upsert: true}
                )
            })
        ),
        Promise.all(
            Array.from(dailyBuckets.values()).map(async (bucket) => {
                const existing = await AggregateDailyModel.findOne({
                    terrariumId,
                    type: bucket.type,
                    day: bucket.keyDate,
                })

                const merged = mergeStats(existing, bucket)

                if (!merged) {
                    return
                }

                await AggregateDailyModel.updateOne(
                    {
                        terrariumId,
                        type: bucket.type,
                        day: bucket.keyDate,
                    },
                    {
                        $set: {
                            terrariumId,
                            type: bucket.type,
                            day: bucket.keyDate,
                            avg: merged.avg,
                            min: merged.min,
                            max: merged.max,
                            count: merged.count,
                        },
                    },
                    {upsert: true}
                )
            })
        ),
        Promise.all(
            Array.from(hourOfDayBuckets.values()).map(async (bucket) => {
                const existing = await AggregateByHourOfDayModel.findOne({
                    terrariumId,
                    type: bucket.type,
                    hourOfDay: bucket.hourOfDay,
                })

                const merged = mergeStats(existing, bucket)

                if (!merged) {
                    return
                }

                await AggregateByHourOfDayModel.updateOne(
                    {
                        terrariumId,
                        type: bucket.type,
                        hourOfDay: bucket.hourOfDay,
                    },
                    {
                        $set: {
                            terrariumId,
                            type: bucket.type,
                            hourOfDay: bucket.hourOfDay,
                            avg: merged.avg,
                            min: merged.min,
                            max: merged.max,
                            count: merged.count,
                        },
                    },
                    {upsert: true}
                )
            })
        ),
    ])
}
