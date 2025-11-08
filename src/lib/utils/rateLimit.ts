type Bucket = {
    count: number
    expiresAt: number
}

const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now()
    const bucket = buckets.get(key)

    if (!bucket || bucket.expiresAt < now) {
        buckets.set(key, {count: 1, expiresAt: now + windowMs})
        return true
    }

    if (bucket.count >= limit) {
        return false
    }

    bucket.count += 1
    return true
}
