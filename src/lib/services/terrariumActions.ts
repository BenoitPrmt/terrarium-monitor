import type {Types} from "mongoose"

import {TerrariumActionModel} from "@/models/TerrariumAction"
import type {TerrariumActionDocument} from "@/models/TerrariumAction"
import type {TerrariumActionEntry} from "@/types/terrarium"

export function serializeTerrariumAction(
    doc: TerrariumActionDocument
): TerrariumActionEntry {
    return {
        id: doc._id.toString(),
        terrariumId: doc.terrariumId.toString(),
        type: doc.type,
        notes: doc.notes,
        performedAt: doc.performedAt.toISOString(),
        createdAt: doc.createdAt?.toISOString() ?? doc.performedAt.toISOString(),
    }
}

export async function listTerrariumActions(
    terrariumId: Types.ObjectId,
    limit = 25
) {
    const entries: TerrariumActionDocument[] = await TerrariumActionModel.find({
        terrariumId,
    })
        .sort({performedAt: -1, createdAt: -1})
        .limit(limit)
        .exec()

    return entries.map((entry) => serializeTerrariumAction(entry))
}
