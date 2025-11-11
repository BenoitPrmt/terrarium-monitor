import {
    Schema,
    model,
    models,
    type HydratedDocument,
    type InferSchemaType,
    type Model,
} from "mongoose"

import {
    TERRARIUM_ACTION_TYPES,
    type TerrariumActionType,
} from "@/constants/terrarium-actions"

const TerrariumActionSchema = new Schema(
    {
        terrariumId: {type: Schema.Types.ObjectId, ref: "Terrarium", required: true},
        type: {
            type: String,
            enum: TERRARIUM_ACTION_TYPES,
            required: true,
        },
        notes: {type: String, required: true, trim: true, maxlength: 500},
        performedAt: {type: Date, required: true},
    },
    {
        timestamps: true,
        minimize: false,
    }
)

TerrariumActionSchema.index({terrariumId: 1, performedAt: -1})

type TerrariumAction = InferSchemaType<typeof TerrariumActionSchema>

export type TerrariumActionDocument = HydratedDocument<TerrariumAction>

export const TerrariumActionModel: Model<TerrariumActionDocument> =
    models.TerrariumAction ?? model("TerrariumAction", TerrariumActionSchema)

export type {TerrariumActionType}
