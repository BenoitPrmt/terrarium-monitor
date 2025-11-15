import {
    Schema,
    model,
    models,
    type InferSchemaType,
    type Model,
    type HydratedDocument,
} from "mongoose"

import {TERRARIUM_LOCATION_VALUES} from "@/constants/terrarium-locations"

const HealthCheckSchema = new Schema(
    {
        url: {type: String, trim: true, maxlength: 500},
        delayMinutes: {type: Number, default: 60},
        isEnabled: {type: Boolean, default: false},
        lastTriggeredAt: {type: Date},
        secretId: {type: String},
    },
    {
        _id: false,
        id: false,
    }
)

const TerrariumSchema = new Schema(
    {
        ownerId: {type: Schema.Types.ObjectId, required: true},
        name: {type: String, required: true, trim: true, maxlength: 120},
        location: {
            type: String,
            enum: TERRARIUM_LOCATION_VALUES,
            default: "other",
        },
        description: {type: String, trim: true, maxlength: 2000},
        uuid: {type: String, required: true, unique: true},
        deviceTokenHash: {type: String, required: true},
        healthCheck: {type: HealthCheckSchema, default: undefined},
    },
    {
        timestamps: true,
        minimize: false,
    }
)

TerrariumSchema.index({ownerId: 1, createdAt: -1})
TerrariumSchema.index({uuid: 1}, {unique: true})

type Terrarium = InferSchemaType<typeof TerrariumSchema>

export type TerrariumDocument = HydratedDocument<Terrarium>

export const TerrariumModel: Model<TerrariumDocument> =
    models.Terrarium ?? model("Terrarium", TerrariumSchema)
