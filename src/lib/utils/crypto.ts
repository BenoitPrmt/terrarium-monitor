import crypto from "node:crypto"

export function hashDeviceToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex")
}

export function timingSafeCompare(a: string, b: string) {
    const bufferA = Buffer.from(a, "utf8")
    const bufferB = Buffer.from(b, "utf8")

    if (bufferA.length !== bufferB.length) {
        return false
    }

    return crypto.timingSafeEqual(bufferA, bufferB)
}

export function verifyDeviceToken(token: string, storedHash: string) {
    const hashed = hashDeviceToken(token)
    return timingSafeCompare(hashed, storedHash)
}

export function createWebhookSignature(payload: string, secret: string) {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export function randomHmacSecret(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex")
}
