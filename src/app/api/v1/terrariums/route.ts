import {NextResponse} from "next/server"

import {auth} from "@/auth"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    terrariumCreateSchema,
    type TerrariumCreateInput,
} from "@/lib/validation/terrarium"
import {
    listTerrariumsForOwner,
    serializeTerrarium,
    toObjectId,
} from "@/lib/services/terrariums"
import {generateUuid, hashDeviceToken} from "@/lib/utils"
import {TerrariumModel} from "@/models/Terrarium"

export const runtime = "nodejs"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    await connectMongoose()
    await ensureDbIndexes()

    const terrariums = await listTerrariumsForOwner(session.user.id)

    return NextResponse.json({
        terrariums: terrariums.map(serializeTerrarium),
    })
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }

    let payload: TerrariumCreateInput
    try {
        payload = terrariumCreateSchema.parse(await request.json())
    } catch {
        return NextResponse.json({error: "invalid_payload"}, {status: 400})
    }

    await connectMongoose()
    await ensureDbIndexes()

    const uuid = generateUuid()
    const deviceToken = generateUuid()

    const terrarium = await TerrariumModel.create({
        ownerId: toObjectId(session.user.id),
        name: payload.name,
        location: payload.location,
        description: payload.description,
        uuid,
        deviceTokenHash: hashDeviceToken(deviceToken),
    })

    return NextResponse.json(
        {
            terrarium: serializeTerrarium(terrarium),
            deviceToken,
        },
        {status: 201}
    )
}
