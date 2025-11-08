import {
    Schema,
    model,
    models,
    type InferSchemaType,
    type Model,
} from "mongoose"

import {METRIC_TYPES} from "./constants"

const AggregateDailySchema = new Schema(
    {
        terrariumId: {type: Schema.Types.ObjectId, required: true, index: true},
        day: {type: Date, required: true},
        type: {type: String, enum: METRIC_TYPES, required: true},
        count: {type: Number, required: true},
        avg: {type: Number, required: true},
        min: {type: Number, required: true},
        max: {type: Number, required: true},
    },
    {
        timestamps: true,
        minimize: false,
    }
)

AggregateDailySchema.index(
    {terrariumId: 1, type: 1, day: 1},
    {unique: true}
)

export type AggregateDailyDocument = InferSchemaType<typeof AggregateDailySchema>

export const AggregateDailyModel: Model<AggregateDailyDocument> =
    models.AggregateDaily ??
    model("AggregateDaily", AggregateDailySchema, "aggregate_daily")
