import {
    Schema,
    model,
    models,
    type InferSchemaType,
    type Model,
} from "mongoose"

import {METRIC_TYPES} from "./constants"

const AggregateByHourOfDaySchema = new Schema(
    {
        terrariumId: {type: Schema.Types.ObjectId, required: true, index: true},
        hourOfDay: {type: Number, required: true, min: 0, max: 23},
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

AggregateByHourOfDaySchema.index(
    {terrariumId: 1, type: 1, hourOfDay: 1},
    {unique: true}
)

export type AggregateByHourOfDayDocument = InferSchemaType<
    typeof AggregateByHourOfDaySchema
>

export const AggregateByHourOfDayModel: Model<AggregateByHourOfDayDocument> =
    models.AggregateByHourOfDay ??
    model(
        "AggregateByHourOfDay",
        AggregateByHourOfDaySchema,
        "aggregate_by_hour_of_day"
    )
