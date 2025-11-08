import {AggregateByHourOfDayModel} from "@/models/AggregateByHourOfDay"
import {AggregateDailyModel} from "@/models/AggregateDaily"
import {AggregateHourlyModel} from "@/models/AggregateHourly"
import {SampleModel} from "@/models/Sample"
import {TerrariumModel} from "@/models/Terrarium"
import {WebhookModel} from "@/models/Webhook"

let ensured = false

export async function ensureDbIndexes() {
    if (ensured) {
        return
    }

    ensured = true

    await Promise.all([
        TerrariumModel.createIndexes(),
        SampleModel.createIndexes(),
        AggregateHourlyModel.createIndexes(),
        AggregateDailyModel.createIndexes(),
        AggregateByHourOfDayModel.createIndexes(),
        WebhookModel.createIndexes(),
    ])
}
