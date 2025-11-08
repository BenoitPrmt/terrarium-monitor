import {
    Schema,
    model,
    models,
    type InferSchemaType,
    type Model,
} from "mongoose"

const UserExtraSchema = new Schema(
    {
        userId: {type: Schema.Types.ObjectId, required: true, unique: true},
        timezone: {type: String, default: "UTC"},
        notificationEmail: {type: String},
    },
    {
        timestamps: true,
        minimize: false,
    }
)

export type UserExtraDocument = InferSchemaType<typeof UserExtraSchema>

export const UserExtraModel: Model<UserExtraDocument> =
    models.UserExtra ?? model("UserExtra", UserExtraSchema)
