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

type TimeAgoOptions = {
    locale?: string;
    now?: Date;
}

export function timeAgoInWords(date: Date, options?: TimeAgoOptions) {
    const {locale = "fr", now = new Date()} = options ?? {};
    const rtf = new Intl.RelativeTimeFormat(locale, {style: "short"});

    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    if (Math.abs(diffSeconds) < 60) {
        return rtf.format(-diffSeconds, 'second');
    }

    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) {
        return rtf.format(-diffMinutes, 'minute');
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
        return rtf.format(-diffHours, 'hour');
    }

    const diffDays = Math.round(diffHours / 24);
    return rtf.format(-diffDays, 'day');
}
