import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export * from "./crypto"
export * from "./rateLimit"
export * from "./time"
export * from "./uuid"
export * from "./webhook"
