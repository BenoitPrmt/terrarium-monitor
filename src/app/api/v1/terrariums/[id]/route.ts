import {NextResponse} from "next/server"

import {auth} from "@/auth"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    terrariumUpdateSchema,
    type TerrariumUpdateInput,
} from "@/lib/validation/terrarium"
import {
    requireTerrariumForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums"
import {AggregateByHourOfDayModel} from "@/models/AggregateByHourOfDay"
import {AggregateDailyModel} from "@/models/AggregateDaily"
import {AggregateHourlyModel} from "@/models/AggregateHourly"
import {SampleModel} from "@/models/Sample"
import {TerrariumModel} from "@/models/Terrarium"
import {WebhookModel} from "@/models/Webhook"
import {generateUuid, hashDeviceToken} from "@/lib/utils"

export const runtime = "nodejs"

function badRequest() {
    return NextResponse.json({error: "invalid_id"}, {status: 400})
}

export async function GET(
    _request: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params

    if (!id) {
        return badRequest()
    }

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    await connectMongoose()
    await ensureDbIndexes()

    try {
        const terrarium = await requireTerrariumForOwner(id, session.user.id)
        return NextResponse.json({terrarium: serializeTerrarium(terrarium)})
    } catch {
        return NextResponse.json({error: "not_found"}, {status: 404})
    }
}

export async function PUT(
    request: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params

    if (!id) {
        return badRequest()
    }

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    let payload: TerrariumUpdateInput
    try {
        payload = terrariumUpdateSchema.parse(await request.json())
    } catch {
        return NextResponse.json({error: "invalid_payload"}, {status: 400})
    }

    await connectMongoose()
    await ensureDbIndexes()

    try {
        const terrarium = await requireTerrariumForOwner(id, session.user.id)

        const update: Record<string, unknown> = {}
        if (payload.name) update.name = payload.name
        if (payload.location !== undefined) update.location = payload.location
        if (payload.description !== undefined)
            update.description = payload.description

        let newToken: string | undefined
        if (payload.regenerateToken) {
            newToken = generateUuid()
            update.deviceTokenHash = hashDeviceToken(newToken)
        }

        const updated = await TerrariumModel.findByIdAndUpdate(
            terrarium._id,
            {$set: update},
            {new: true}
        )

        if (!updated) {
            return NextResponse.json({error: "not_found"}, {status: 404})
        }

        return NextResponse.json({
            terrarium: serializeTerrarium(updated),
            deviceToken: newToken,
        })
    } catch {
        return NextResponse.json({error: "not_found"}, {status: 404})
    }
}

export async function DELETE(
    _request: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params

    if (!id) {
        return badRequest()
    }

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    await connectMongoose()
    await ensureDbIndexes()

    try {
        const terrarium = await requireTerrariumForOwner(id, session.user.id)
        const terrariumId = terrarium._id

        await Promise.all([
            SampleModel.deleteMany({terrariumId}),
            AggregateHourlyModel.deleteMany({terrariumId}),
            AggregateDailyModel.deleteMany({terrariumId}),
            AggregateByHourOfDayModel.deleteMany({terrariumId}),
            WebhookModel.deleteMany({terrariumId}),
            TerrariumModel.deleteOne({_id: terrariumId}),
        ])

        return NextResponse.json({status: "deleted"}, {status: 200})
    } catch {
        return NextResponse.json({error: "not_found"}, {status: 404})
    }
}
