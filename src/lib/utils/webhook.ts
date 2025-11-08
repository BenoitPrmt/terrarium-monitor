import {createWebhookSignature} from "./crypto"

export type WebhookPayload = {
    terrariumId: string
    metric: string
    comparator: string
    threshold: number
    current: number
    at: string
    samplesCountInBatch: number
}

type WebhookHeaders = {
    terrariumId: string
    metric: string
    signatureSecret: string
    secretId?: string
}

const DEFAULT_USER_AGENT = "terrarium-monitor/1.0"

export async function sendWebhookWithRetry(
    url: string,
    payload: WebhookPayload,
    headers: WebhookHeaders,
    retries = 3
) {
    const userAgent = process.env.WEBHOOK_USER_AGENT || DEFAULT_USER_AGENT
    const body = JSON.stringify(payload)
    const signature = createWebhookSignature(body, headers.signatureSecret)

    let attempt = 0
    let delay = 500

    while (attempt < retries) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": userAgent,
                    "X-Terrarium-Id": headers.terrariumId,
                    "X-Metric": headers.metric,
                    "X-Signature": signature,
                    ...(headers.secretId ? {"X-Secret-Id": headers.secretId} : {}),
                },
                body,
                cache: "no-store",
            })

            if (response.ok) {
                return true
            }

            if (response.status >= 500) {
                attempt += 1
                await new Promise((resolve) => setTimeout(resolve, delay))
                delay *= 2
                continue
            }

            return false
        } catch (error) {
            attempt += 1
            if (attempt >= retries) {
                throw error
            }
            await new Promise((resolve) => setTimeout(resolve, delay))
            delay *= 2
        }
    }

    return false
}
