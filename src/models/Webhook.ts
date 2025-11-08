import {
    Schema,
    model,
    models,
    type InferSchemaType,
    type Model,
    type HydratedDocument,
} from "mongoose"

import {METRIC_TYPES, WEBHOOK_COMPARATORS} from "./constants"

const WebhookSchema = new Schema(
    {
        terrariumId: {type: Schema.Types.ObjectId, required: true, index: true},
        name: {type: String, required: true, maxlength: 120},
        url: {type: String, required: true},
        isActive: {type: Boolean, default: true},
        metric: {type: String, enum: METRIC_TYPES, required: true},
        comparator: {type: String, enum: WEBHOOK_COMPARATORS, required: true},
        threshold: {type: Number, required: true},
        cooldownSec: {type: Number, default: 900},
        lastTriggeredAt: {type: Date},
        secretId: {type: String},
    },
    {
        timestamps: true,
        minimize: false,
    }
)

WebhookSchema.index({terrariumId: 1, metric: 1})

type Webhook = InferSchemaType<typeof WebhookSchema>

export type WebhookDocument = HydratedDocument<Webhook>

export const WebhookModel: Model<WebhookDocument> =
    models.Webhook ?? model("Webhook", WebhookSchema)
