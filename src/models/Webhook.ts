import {
    Schema,
    model,
    models,
    type InferSchemaType,
    type Model,
    type HydratedDocument,
} from "mongoose"

import {WEBHOOK_BODY_PRESETS} from "@/lib/utils/webhook-payload"
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
        bodyPreset: {
            type: String,
            enum: WEBHOOK_BODY_PRESETS,
            default: "default",
        },
        discordBodyConfig: {
            content: {type: String, maxlength: 1000},
            embedTitle: {type: String, maxlength: 256},
            embedDescription: {type: String, maxlength: 2000},
            embedColor: {type: String, maxlength: 7},
            fields: [
                {
                    name: {type: String, maxlength: 256},
                    value: {type: String, maxlength: 1024},
                    inline: {type: Boolean, default: true},
                    _id: false,
                },
            ],
        },
        customBodyTemplate: {type: String, maxlength: 5000},
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
