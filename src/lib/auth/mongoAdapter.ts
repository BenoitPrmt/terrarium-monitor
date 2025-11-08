import {MongoDBAdapter} from "@auth/mongodb-adapter"
import type {Adapter} from "next-auth/adapters"
import {MongoClient, type Db} from "mongodb"

const uri = process.env.MONGODB_URI

if (!uri) {
    throw new Error("MONGODB_URI is not defined")
}

const parsedDbName = (() => {
    try {
        const dbFromEnv = process.env.MONGODB_DB?.trim()
        if (dbFromEnv) {
            return dbFromEnv
        }

        const url = new URL(uri)
        const pathname = url.pathname.replace(/^\//, "")
        return pathname || undefined
    } catch {
        return undefined
    }
})()

declare global {
    let _mongoClientPromise: Promise<MongoClient> | undefined;
}

const globalForMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
}

const client = new MongoClient(uri)
const clientPromise =
    globalForMongo._mongoClientPromise ??
    client.connect().catch((error) => {
        console.error("Failed to connect to MongoDB", error)
        throw error
    })

if (process.env.NODE_ENV !== "production") {
    globalForMongo._mongoClientPromise = clientPromise
}

export const authMongoClientPromise = clientPromise

export const authMongoAdapter = MongoDBAdapter(clientPromise, {
    databaseName: parsedDbName,
}) as Adapter

export async function getAuthDb(): Promise<Db> {
    const resolvedClient = await clientPromise
    return parsedDbName ? resolvedClient.db(parsedDbName) : resolvedClient.db()
}
