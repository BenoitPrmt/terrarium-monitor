import type {DefaultSession} from "next-auth"
import "next-auth/jwt"
import type {AppUserRole} from "@/lib/auth/auth"
import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: AppUserRole
        } & DefaultSession["user"]
    }

    interface User {
        role: AppUserRole
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: AppUserRole
    }
}
