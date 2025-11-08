import {NextResponse} from "next/server"
import {hash} from "bcryptjs"
import {z} from "zod"

import {getAuthDb} from "@/lib/auth/mongoAdapter"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {name, email, password} = registerSchema.parse(body)

        const db = await getAuthDb()
        const users = db.collection("users")
        const existingUser = await users.findOne({email})

        if (existingUser) {
            return NextResponse.json({error: "email_exists"}, {status: 400})
        }

        const hashedPassword = await hash(password, 12)

        const result = await users.insertOne({
            name,
            email,
            passwordHash: hashedPassword,
            role: "USER",
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        return NextResponse.json(
            {userId: result.insertedId.toString(), email, name},
            {status: 201}
        )
    } catch (error) {
        console.error("[REGISTER_ERROR]", error)
        return NextResponse.json(
            {error: "internal_error"},
            {status: 500}
        )
    }
}
