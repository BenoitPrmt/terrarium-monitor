import {differenceInHours} from "date-fns"

export function toUtcDate(value: number | Date | string) {
    if (value instanceof Date) {
        return value
    }

    if (typeof value === "number") {
        return new Date(value * 1000)
    }

    return new Date(value)
}

export function truncateToHour(date: Date) {
    const copy = new Date(date)
    copy.setUTCMinutes(0, 0, 0)
    return copy
}

export function truncateToDay(date: Date) {
    const copy = new Date(date)
    copy.setUTCHours(0, 0, 0, 0)
    return copy
}

export function getHourOfDay(date: Date) {
    return date.getUTCHours()
}

export function clampToIngestionWindow(date: Date, windowHours = 24) {
    const now = new Date()
    const diff = differenceInHours(date, now)
    if (diff > windowHours) {
        return new Date(now.getTime() + windowHours * 60 * 60 * 1000)
    }
    if (diff < -windowHours) {
        return new Date(now.getTime() - windowHours * 60 * 60 * 1000)
    }
    return date
}
