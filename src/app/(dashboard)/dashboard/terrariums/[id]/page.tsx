import Link from "next/link"
import {redirect} from "next/navigation"

import {currentUser} from "@/auth/current-user"
import {ensureDbIndexes} from "@/lib/db/ensureIndexes"
import {connectMongoose} from "@/lib/db/mongoose"
import {
    requireTerrariumForOwner,
    serializeTerrarium,
} from "@/lib/services/terrariums"
import {getAggregates} from "@/lib/services/metrics"
import {SampleModel} from "@/models/Sample"
import type {MetricType} from "@/models/constants"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {MetricsFilters} from "@/components/terrariums/MetricsFilters"
import {HourMetricSelect} from "@/components/terrariums/HourMetricSelect"
import {TimeSeriesChart, type TimeSeriesDatum} from "@/components/charts/TimeSeries"
import {CompareHoursChart} from "@/components/charts/CompareHours"

const metricConfigs = [
    {key: "TEMPERATURE", label: "Température (°C)", color: "#f97316"},
    {key: "HUMIDITY", label: "Humidité (%)", color: "#0ea5e9"},
    {key: "PRESSURE", label: "Pression (hPa)", color: "#8b5cf6"},
]

const rangeMap: Record<string, number> = {
    "24h": 24,
    "7d": 24 * 7,
    "30d": 24 * 30,
}

type PageProps = {
    params: Promise<{ id: string }>
    searchParams: {
        granularity?: "raw" | "hourly" | "daily"
        range?: string
        hodMetric?: MetricType
    }
}

export default async function TerrariumDetailPage({
                                                      params,
                                                      searchParams,
                                                  }: PageProps) {
    const user = await currentUser()
    if (!user) {
        redirect("/login")
    }
    const {id} = await params;

    await connectMongoose()
    await ensureDbIndexes()

    const granularity = searchParams.granularity ?? "hourly"
    const rangeKey = searchParams.range && rangeMap[searchParams.range] ? searchParams.range : "24h"
    const hours = rangeMap[rangeKey]
    const to = new Date()
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000)

    const terrariumDoc = await requireTerrariumForOwner(id, user.id)
    const terrarium = serializeTerrarium(terrariumDoc)

    const seriesData = await Promise.all(
        metricConfigs.map((metric) =>
            getAggregates({
                terrariumId: terrariumDoc._id,
                type: metric.key as MetricType,
                granularity,
                from,
                to,
                limit: 500,
            })
        )
    )

    const mergedSeries = mergeSeries(metricConfigs.map((m) => m.key), seriesData)

    const hodMetric: MetricType = searchParams.hodMetric ?? "HUMIDITY"
    const hodData = (await getAggregates({
        terrariumId: terrariumDoc._id,
        type: hodMetric,
        granularity: "byHourOfDay",
    })) as Array<{ hourOfDay: number; avg: number }>

    const recentSamples = await SampleModel.find({
        terrariumId: terrariumDoc._id,
    })
        .sort({ts: -1})
        .limit(20)
        .lean()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Terrarium</p>
                    <h1 className="text-3xl font-semibold">{terrarium.name}</h1>
                    <p className="text-muted-foreground">
                        UUID: <code>{terrarium.uuid}</code>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/terrariums/${terrarium.id}/settings`}>
                            Paramètres
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/terrariums/${terrarium.id}/webhooks`}>
                            Webhooks
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vue d’ensemble</CardTitle>
                    <CardDescription>Détails généraux du terrarium.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                    <InfoLine label="Emplacement" value={terrarium.location || "Non défini"}/>
                    <InfoLine
                        label="Créé le"
                        value={
                            terrarium.createdAt
                                ? new Date(terrarium.createdAt).toLocaleString()
                                : "—"
                        }
                    />
                    <InfoLine
                        label="Dernière mise à jour"
                        value={
                            terrarium.updatedAt
                                ? new Date(terrarium.updatedAt).toLocaleString()
                                : "—"
                        }
                    />
                    <InfoLine label="UUID public" value={terrarium.uuid}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="space-y-4">
                    <div>
                        <CardTitle>Séries temporelles</CardTitle>
                        <CardDescription>
                            Température, humidité et pression sur la période sélectionnée.
                        </CardDescription>
                    </div>
                    <MetricsFilters granularity={granularity} range={rangeKey}/>
                </CardHeader>
                <CardContent>
                    <TimeSeriesChart
                        data={mergedSeries}
                        series={metricConfigs}
                        granularity={granularity}
                    />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Analyse par heure de la journée</CardTitle>
                        <HourMetricSelect value={hodMetric}/>
                    </CardHeader>
                    <CardContent>
                        <CompareHoursChart
                            data={hodData.map((entry) => ({
                                hourOfDay: entry.hourOfDay,
                                value: entry.avg,
                            }))}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Mesures récentes</CardTitle>
                        <CardDescription>20 derniers échantillons ingérés.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Valeur</TableHead>
                                    <TableHead>Unité</TableHead>
                                    <TableHead>Horodatage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSamples.map((sample) => (
                                    <TableRow key={sample._id.toString()}>
                                        <TableCell>{sample.type}</TableCell>
                                        <TableCell>{sample.value.toFixed(2)}</TableCell>
                                        <TableCell>{sample.unit}</TableCell>
                                        <TableCell>
                                            {new Date(sample.ts).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {recentSamples.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            Pas encore de données.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function mergeSeries(metrics: string[], datasets: Record<string, any>[][]) {
    const map = new Map<string, TimeSeriesDatum>()

    metrics.forEach((metric, index) => {
        const dataset = datasets[index] ?? []
        for (const entry of dataset) {
            const bucketKey: string | undefined =
                entry.ts ?? entry.hour ?? entry.day
            if (!bucketKey) continue

            if (!map.has(bucketKey)) {
                map.set(bucketKey, {bucket: bucketKey})
            }
            const point = map.get(bucketKey)!
            if (typeof entry.value === "number") {
                point[metric] = entry.value
            } else if (typeof entry.avg === "number") {
                point[metric] = entry.avg
            }
        }
    })

    return Array.from(map.values()).sort((a, b) =>
        String(a.bucket) <= String(b.bucket) ? -1 : 1
    )
}

function InfoLine({label, value}: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    )
}
