import NextAuth, {type NextAuthConfig} from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import {compare} from "bcryptjs"
import {z} from "zod"
import type {ObjectId} from "mongodb"

import {authMongoAdapter, getAuthDb} from "./mongoAdapter"

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

const providers: NextAuthConfig["providers"] = [
    Credentials({
        name: "Credentials",
        credentials: {
            email: {label: "Email", type: "email"},
            password: {label: "Password", type: "password"},
        },
        async authorize(credentials) {
            const parsed = credentialsSchema.safeParse(credentials)

            if (!parsed.success) {
                return null
            }

            const db = await getAuthDb()
            type AuthUserDoc = {
                _id: ObjectId
                email?: string
                name?: string
                passwordHash?: string
                role?: AppUserRole
            }
            const users = db.collection<AuthUserDoc>("users")
            const user = await users.findOne({email: parsed.data.email})

            if (!user?._id || !user.passwordHash) {
                return null
            }

            const isValid = await compare(parsed.data.password, user.passwordHash)

            if (!isValid) {
                return null
            }

            return {
                id: user._id.toString(),
                email: user.email ?? parsed.data.email,
                name: user.name ?? user.email ?? parsed.data.email,
                role: (user.role as AppUserRole | undefined) ?? "USER",
            }
        },
    }),
]

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })
    )
}

export const authConfig = {
    adapter: authMongoAdapter,
    session: {
        strategy: "jwt",
    },
    providers,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({session, token}) {
            if (session.user) {
                session.user.id = token.sub as string
                session.user.role = (token.role as AppUserRole | undefined) ?? "USER"
            }

            return session
        },
        async jwt({token, user}) {
            if (user) {
                token.role = (user as { role?: AppUserRole }).role ?? "USER"
            }

            return token
        },
    },
} satisfies NextAuthConfig

export const {auth, handlers, signIn, signOut} = NextAuth(authConfig)

export type AppUserRole = "USER" | "ADMIN"
