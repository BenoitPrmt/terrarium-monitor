import {NextResponse} from "next/server"

import {auth} from "@/auth"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {aggregatesQuerySchema} from "@/lib/validation/aggregates"
import {requireTerrariumForOwner} from "@/lib/services/terrariums"
import {getAggregates} from "@/lib/services/metrics"

export const runtime = "nodejs"

export async function GET(
    request: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    const url = new URL(request.url)
    const parsedQuery = aggregatesQuerySchema.safeParse({
        type: url.searchParams.get("type"),
        granularity: url.searchParams.get("granularity") ?? undefined,
        from: url.searchParams.get("from") ?? undefined,
        to: url.searchParams.get("to") ?? undefined,
        limit: url.searchParams.get("limit")
            ? Number(url.searchParams.get("limit"))
            : undefined,
    })

    if (!parsedQuery.success) {
        return NextResponse.json({error: "invalid_query"}, {status: 400})
    }

    const query = parsedQuery.data

    await connectMongoose()
    await ensureDbIndexes()

    let terrarium
    try {
        terrarium = await requireTerrariumForOwner(id, session.user.id)
    } catch {
        return NextResponse.json({error: "not_found"}, {status: 404})
    }

    const data = await getAggregates({
        terrariumId: terrarium._id,
        type: query.type,
        granularity: query.granularity,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        limit: query.limit,
    })

    return NextResponse.json({
        granularity: query.granularity,
        type: query.type,
        data,
    })
}
