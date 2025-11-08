import {
    Schema,
    model,
    models,
    type InferSchemaType,
    type Model,
} from "mongoose"

import {METRIC_TYPES} from "./constants"

const AggregateHourlySchema = new Schema(
    {
        terrariumId: {type: Schema.Types.ObjectId, required: true, index: true},
        hour: {type: Date, required: true},
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

AggregateHourlySchema.index(
    {terrariumId: 1, type: 1, hour: 1},
    {unique: true}
)

export type AggregateHourlyDocument = InferSchemaType<typeof AggregateHourlySchema>

export const AggregateHourlyModel: Model<AggregateHourlyDocument> =
    models.AggregateHourly ??
    model("AggregateHourly", AggregateHourlySchema, "aggregate_hourly")
