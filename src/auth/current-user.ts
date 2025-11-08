import {auth} from "@/auth"

export const currentUser = async () => {
    const session = await auth()

    if (!session?.user) {
        return null
    }

    return session.user
}

export const requiredCurrentUser = async () => {
    const user = await currentUser()

    if (!user) {
        throw new Error("User not found")
    }

    return user
}
