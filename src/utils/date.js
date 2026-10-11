const DAY_MS = 24 * 60 * 60 * 1000;

export function isCreatedWithinLastDay(createdAt, now = Date.now()) {
    if (!createdAt) return false;

    const createdAtMs = new Date(createdAt).getTime();
    const ageMs = now - createdAtMs;

    return Number.isFinite(createdAtMs) && ageMs >= 0 && ageMs < DAY_MS;
}