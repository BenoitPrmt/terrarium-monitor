import {
    Schema,
    model,
    models,
    type InferSchemaType,
    type Model,
} from "mongoose"

import {METRIC_TYPES, SAMPLE_UNITS} from "./constants"

const SAMPLE_RETENTION_DAYS = 31
const SAMPLE_TTL_SECONDS = SAMPLE_RETENTION_DAYS * 24 * 60 * 60

const SampleSchema = new Schema(
    {
        terrariumId: {type: Schema.Types.ObjectId, required: true, index: true},
        deviceId: {type: String, trim: true, maxlength: 64},
        ts: {type: Date, required: true},
        type: {type: String, enum: METRIC_TYPES, required: true, index: true},
        unit: {type: String, enum: SAMPLE_UNITS, required: true},
        value: {type: Number, required: true},
        sentAt: {type: Date},
    },
    {
        timestamps: true,
        minimize: false,
    }
)

SampleSchema.index({terrariumId: 1, ts: 1})
SampleSchema.index({terrariumId: 1, type: 1, ts: 1})
SampleSchema.index(
    {ts: 1},
    {
        expireAfterSeconds: SAMPLE_TTL_SECONDS,
        name: "sample_ts_ttl",
    }
)

export type SampleDocument = InferSchemaType<typeof SampleSchema>

export const SampleModel: Model<SampleDocument> =
    models.Sample ?? model("Sample", SampleSchema)
