import type {MetricType} from "@/models/constants"

export const WEBHOOK_BODY_PRESETS = ["default", "discord", "custom"] as const
export type WebhookBodyPreset = (typeof WEBHOOK_BODY_PRESETS)[number]

export type WebhookPayloadContext = {
    terrarium: {
        id: string
        name: string
    }
    metric: MetricType
    comparator: string
    threshold: number
    current: number
    at: string
    samplesCountInBatch: number
}

type WebhookPayloadConfig = {
    bodyPreset?: WebhookBodyPreset | null
    discordBodyConfig?: DiscordBodyConfigInput | null
    customBodyTemplate?: string | null
}

export type DiscordBodyFieldConfig = {
    name: string
    value: string
    inline: boolean
}

export type DiscordBodyConfig = {
    content: string
    embedTitle: string
    embedDescription: string
    embedColor: string
    fields: DiscordBodyFieldConfig[]
}

export type DiscordBodyConfigInput =
    | {
          content?: string | null
          embedTitle?: string | null
          embedDescription?: string | null
          embedColor?: string | null
          fields?:
              | Array<{
                    name?: string | null
                    value?: string | null
                    inline?: boolean | null
                } | null>
              | null
      }
    | null

export const DEFAULT_DISCORD_BODY_CONFIG: DiscordBodyConfig = {
    content:
        "Alert on {{terrarium.name}}: {{metric}} is {{current}} ({{comparator}} {{threshold}})",
    embedTitle: "Terrarium alert",
    embedDescription: "{{metric}} crossed the configured threshold.",
    embedColor: "#22c55e",
    fields: [
        {
            name: "Terrarium",
            value: "{{terrarium.name}}",
            inline: true,
        },
        {
            name: "Value",
            value: "{{current}}",
            inline: true,
        },
        {
            name: "Rule",
            value: "{{comparator}} {{threshold}}",
            inline: true,
        },
    ],
}

export const DEFAULT_CUSTOM_BODY_TEMPLATE = `{
  "terrarium": "{{terrarium.name}}",
  "metric": "{{metric}}",
  "current": "{{current}}",
  "threshold": "{{threshold}}",
  "message": "{{terrarium.name}}: {{metric}} is {{current}}"
}`

export function createDefaultWebhookPayload(context: WebhookPayloadContext) {
    return {
        terrariumId: context.terrarium.id,
        terrariumName: context.terrarium.name,
        metric: context.metric,
        comparator: context.comparator,
        threshold: context.threshold,
        current: context.current,
        at: context.at,
        samplesCountInBatch: context.samplesCountInBatch,
    }
}

export function createDiscordWebhookPayload(
    context: WebhookPayloadContext,
    config: DiscordBodyConfigInput | undefined = DEFAULT_DISCORD_BODY_CONFIG
) {
    const normalizedConfig = normalizeDiscordBodyConfig(config)

    return {
        content: renderTemplateString(normalizedConfig.content, context),
        embeds: [
            {
                title: renderTemplateString(normalizedConfig.embedTitle, context),
                description: renderTemplateString(
                    normalizedConfig.embedDescription,
                    context
                ),
                color: parseDiscordColor(normalizedConfig.embedColor),
                fields: normalizedConfig.fields.map((field) => ({
                    name: renderTemplateString(field.name, context),
                    value: String(renderTemplateString(field.value, context)),
                    inline: field.inline,
                })),
                timestamp: context.at,
            },
        ],
    }
}

export function createExampleWebhookContext(
    overrides: Partial<WebhookPayloadContext> = {}
): WebhookPayloadContext {
    const {terrarium, ...rest} = overrides

    return {
        metric: "HUMIDITY",
        comparator: "gt",
        threshold: 70,
        current: 74.2,
        at: "2026-05-04T12:30:00.000Z",
        samplesCountInBatch: 1,
        ...rest,
        terrarium: {
            id: terrarium?.id ?? "665f4b7a2f1d2d0000000000",
            name: terrarium?.name ?? "Tropical terrarium",
        },
    }
}

export function buildWebhookPayload(
    config: WebhookPayloadConfig,
    context: WebhookPayloadContext
) {
    switch (config.bodyPreset ?? "default") {
        case "discord":
            return createDiscordWebhookPayload(context, config.discordBodyConfig)
        case "custom":
            return renderCustomWebhookPayload(
                config.customBodyTemplate || DEFAULT_CUSTOM_BODY_TEMPLATE,
                context
            )
        case "default":
        default:
            return createDefaultWebhookPayload(context)
    }
}

export function normalizeDiscordBodyConfig(
    config: DiscordBodyConfigInput | undefined
): DiscordBodyConfig {
    return {
        content: config?.content ?? DEFAULT_DISCORD_BODY_CONFIG.content,
        embedTitle: config?.embedTitle ?? DEFAULT_DISCORD_BODY_CONFIG.embedTitle,
        embedDescription:
            config?.embedDescription ??
            DEFAULT_DISCORD_BODY_CONFIG.embedDescription,
        embedColor: config?.embedColor ?? DEFAULT_DISCORD_BODY_CONFIG.embedColor,
        fields:
            config?.fields?.length
                ? config.fields.flatMap((field, index) =>
                      field
                          ? [
                                {
                                    name:
                                        field.name ??
                                        DEFAULT_DISCORD_BODY_CONFIG.fields[
                                            Math.min(
                                                index,
                                                DEFAULT_DISCORD_BODY_CONFIG.fields.length - 1
                                            )
                                        ].name,
                                    value:
                                        field.value ??
                                        DEFAULT_DISCORD_BODY_CONFIG.fields[
                                            Math.min(
                                                index,
                                                DEFAULT_DISCORD_BODY_CONFIG.fields.length - 1
                                            )
                                        ].value,
                                    inline: field.inline ?? true,
                                },
                            ]
                          : []
                  )
                : DEFAULT_DISCORD_BODY_CONFIG.fields,
    }
}

export function renderCustomWebhookPayload(
    template: string,
    context: WebhookPayloadContext
) {
    const parsed = JSON.parse(template)
    const rendered = replaceTemplateValues(parsed, context)
    if (!isRecord(rendered)) {
        throw new Error("Webhook body template must render to a JSON object")
    }

    return rendered
}

export function isValidCustomWebhookTemplate(template: string) {
    try {
        renderCustomWebhookPayload(template, createExampleWebhookContext())
        return true
    } catch {
        return false
    }
}

function replaceTemplateValues(value: unknown, context: WebhookPayloadContext): unknown {
    if (typeof value === "string") {
        return renderTemplateString(value, context)
    }

    if (Array.isArray(value)) {
        return value.map((item) => replaceTemplateValues(item, context))
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                replaceTemplateValues(item, context),
            ])
        )
    }

    return value
}

function renderTemplateString(template: string, context: WebhookPayloadContext) {
    const exactMatch = template.match(/^{{\s*([\w.]+)\s*}}$/)
    if (exactMatch) {
        return resolveTemplatePath(exactMatch[1], context)
    }

    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, path: string) =>
        String(resolveTemplatePath(path, context) ?? "")
    )
}

function parseDiscordColor(color: string) {
    const normalized = color.trim().replace("#", "")
    const parsed = Number.parseInt(normalized, 16)

    if (Number.isNaN(parsed)) {
        return parseDiscordColor(DEFAULT_DISCORD_BODY_CONFIG.embedColor)
    }

    return parsed
}

function resolveTemplatePath(path: string, context: WebhookPayloadContext) {
    const aliases: Record<string, unknown> = {
        terrariumId: context.terrarium.id,
        terrariumName: context.terrarium.name,
    }

    if (path in aliases) {
        return aliases[path]
    }

    return path.split(".").reduce<unknown>((current, part) => {
        if (!current || typeof current !== "object") {
            return undefined
        }

        return (current as Record<string, unknown>)[part]
    }, context)
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}
