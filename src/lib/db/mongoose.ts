import mongoose from "mongoose"

const mongooseUri = process.env.MONGOOSE_URI ?? process.env.MONGODB_URI

if (!mongooseUri) {
    throw new Error("MONGOOSE_URI (or fallback MONGODB_URI) must be defined")
}

const uri = mongooseUri

mongoose.set("strictQuery", true)

declare global {
    let _mongoosePromise: Promise<typeof mongoose> | undefined
}

const globalForMongoose = globalThis as typeof globalThis & {
    _mongoosePromise?: Promise<typeof mongoose>
}

export function getMongooseConnection() {
    return mongoose.connection
}

export async function connectMongoose() {
    if (mongoose.connection.readyState === 1) {
        return mongoose
    }

    if (!globalForMongoose._mongoosePromise) {
        globalForMongoose._mongoosePromise = mongoose.connect(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        })
    }

    return globalForMongoose._mongoosePromise
}
