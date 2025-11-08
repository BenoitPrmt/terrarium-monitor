import {v4 as uuidv4, validate} from "uuid"

export function generateUuid() {
    return uuidv4()
}

export function assertUuid(value: string) {
    if (!validate(value)) {
        throw new Error("Invalid UUID")
    }
}
