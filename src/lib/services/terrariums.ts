import {Types} from "mongoose"

import {connectMongoose} from "@/lib/db/mongoose"
import {TerrariumModel, type TerrariumDocument} from "@/models/Terrarium"

export function toObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid identifier")
    }

    return new Types.ObjectId(id)
}

function maybeObjectId(id: string) {
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null
}

export async function requireTerrariumForOwner(terrariumId: string, ownerId: string) {
    await connectMongoose()

    const ownerObjectId = maybeObjectId(ownerId)
    const terrariumObjectId = maybeObjectId(terrariumId)

    console.log("ownerObjectId", ownerObjectId, "terrariumObjectId", terrariumObjectId)

    const baseFilter = terrariumObjectId
        ? {_id: terrariumObjectId}
        : {uuid: terrariumId}

    const ownerFilters = ownerObjectId
        ? [{ownerId: ownerObjectId}, {ownerId}]
        : [{ownerId}]

    console.log('baseFilter', baseFilter, 'ownerFilters', ownerFilters)

    let terrarium = await TerrariumModel.findOne({
        ...baseFilter,
        $or: ownerFilters,
    })

    if (!terrarium && !terrariumObjectId) {
        const fallbackObjectId = maybeObjectId(terrariumId)
        if (fallbackObjectId) {
            terrarium = await TerrariumModel.findOne({
                _id: fallbackObjectId,
                $or: ownerFilters,
            })
        }
    }

    console.log("requireTerrariumForOwner", {
        terrariumId,
        ownerId,
        terrariumFound: !!terrarium,
        terrarium: terrarium,
    })

    if (!terrarium) {
        throw new Error("Terrarium not found")
    }

    return terrarium
}

export function serializeTerrarium(doc: TerrariumDocument) {
    return {
        id: doc._id.toString(),
        ownerId: doc.ownerId.toString(),
        name: doc.name,
        location: doc.location,
        description: doc.description,
        uuid: doc.uuid,
        createdAt: doc.createdAt?.toISOString(),
        updatedAt: doc.updatedAt?.toISOString(),
    }
}

export async function getTerrariumByUuid(uuid: string) {
    await connectMongoose()
    return TerrariumModel.findOne({uuid})
}

export async function listTerrariumsForOwner(ownerId: string) {
    await connectMongoose()
    const ownerObjectId = maybeObjectId(ownerId)
    const ownerFilters = ownerObjectId
        ? [{ownerId: ownerObjectId}, {ownerId}]
        : [{ownerId}]

    return TerrariumModel.find({$or: ownerFilters}).sort({
        createdAt: -1,
    })
}
