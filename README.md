# Terrarium Monitor

Next.js 16 dashboard for monitoring terrariums with MongoDB, NextAuth and Mongoose.

## Stack

- Next.js 16 (App Router) + React 19
- NextAuth v5 with `@auth/mongodb-adapter`
- MongoDB for both auth (driver) and business data (Mongoose)
- TailwindCSS + shadcn/ui + Recharts
- zod validations + uuid/date-fns utilities

## Prerequisites

- Node.js 18+
- MongoDB instance with two databases (or one shared)
    - `MONGODB_URI` for NextAuth adapter
    - `MONGOOSE_URI` for Mongoose models

## Setup

1. Copy the environment example:

   ```bash
   cp .env.local.example .env.local
   ```

   `.env.local.example`

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=changeme

   MONGODB_URI=mongodb://localhost:27017/terrarium_auth
   MONGOOSE_URI=mongodb://localhost:27017/terrarium_app

   WEBHOOK_USER_AGENT=terrarium-monitor/1.0
   WEBHOOK_SIGNATURE_SECRET=change-me
   INGEST_RATE_PER_MINUTE=120
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Run the dev server

   ```bash
   pnpm dev
   ```

## API overview

| Method         | Route                                  | Description                        |
|----------------|----------------------------------------|------------------------------------|
| POST           | `/api/auth/register`                   | Register credential user           |
| GET/POST       | `/api/v1/terrariums`                   | List / create terrariums           |
| GET/PUT/DELETE | `/api/v1/terrariums/:id`               | CRUD metadata + cascade delete     |
| GET            | `/api/v1/terrariums/:id/aggregates`    | Aggregated data (raw/hourly/daily) |
| GET/POST       | `/api/v1/terrariums/:id/webhooks`      | List/create webhooks               |
| PUT/DELETE     | `/api/v1/terrariums/:id/webhooks/:wid` | Update/delete webhooks             |
| POST           | `/api/v1/record/:uuid`                 | Public ingestion endpoint          |

All `/api/v1/terrariums/*` routes (except ingestion) require an authenticated session.

## Ingestion example

```bash
curl -X POST http://localhost:3000/api/v1/record/your-terrarium-uuid \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: your-device-token" \
  -d '{
    "device_id": "esp32-1",
    "sent_at": 1730971200,
    "samples": [
      { "t": 1730971200, "type": "TEMPERATURE", "unit": "C", "value": 23.8 },
      { "t": 1730971200, "type": "HUMIDITY", "unit": "%", "value": 76.2 }
    ]
  }'
```

## Webhook test payload

Use the dashboard (Terrarium ➜ Webhooks ➜ “Tester”) or trigger manually:

```bash
curl -X POST http://localhost:3000/api/v1/record/your-uuid \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: ..." \
  -d '{ "samples": [{ "t": 1730971200, "type": "HUMIDITY", "unit": "%", "value": 90 }] }'
```

Active webhooks with thresholds that match the ingested values will fire with:

```json
{
  "terrariumId": "...",
  "metric": "HUMIDITY",
  "comparator": "gt",
  "threshold": 85,
  "current": 90,
  "at": "2024-11-07T21:05:00.000Z",
  "samplesCountInBatch": 1
}
```
