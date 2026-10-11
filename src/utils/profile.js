import dayjs from 'dayjs';
import { getCurrentLanguage, normalizeLanguage } from '../i18n';

export const INVENTORY_ITEM_TYPES = {
    BADGE: 'BADGE',
    AVATAR_FRAME: 'AVATAR_FRAME',
};

export function getUserDecorations(equippedItems = []) {
    const byType = {};

    if (Array.isArray(equippedItems)) {
        equippedItems.filter(Boolean).forEach((entry) => {
            const type = entry.type || entry.item?.type;
            if (type) {
                byType[type] = entry;
            }
        });
    }

    return {
        byType,
        badge: byType[INVENTORY_ITEM_TYPES.BADGE] || null,
        avatarFrame: byType[INVENTORY_ITEM_TYPES.AVATAR_FRAME] || null,
    };
}

export function getUserIdentity(user) {
    return user?.userId || user?.id || user?.sub || user?.orgMemberId || null;
}

export function getInitials(name, email = '') {
    const source = name?.trim() || email?.trim() || '?';
    const words = source.split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
}

export function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

export function formatXp(value) {
    return `${formatNumber(value)} XP`;
}

export function formatBand(value, fallback = 'Not set') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return Number(value).toFixed(1);
}

export function formatSkillName(skill, t) {
    const normalized = String(skill || '').toUpperCase();
    const mapping = {
        LISTENING: t ? t('profilePage.skills.listening') : 'Listening',
        READING: t ? t('profilePage.skills.reading') : 'Reading',
        WRITING: t ? t('profilePage.skills.writing') : 'Writing',
        SPEAKING: t ? t('profilePage.skills.speaking') : 'Speaking',
        VOCAB: t ? t('profilePage.skills.vocabulary') : 'Vocabulary',
        VOCABULARY: t ? t('profilePage.skills.vocabulary') : 'Vocabulary',
    };

    return (
        mapping[normalized] ||
        skill ||
        (t ? t('profilePage.common.notSelected') : 'Not selected')
    );
}

export function formatMinutes(totalMinutes, t) {
    const minutes = Number(totalMinutes || 0);

    if (minutes <= 0) {
        return t?.('profilePage.units.minutesShort', { count: 0 }) || '0 min';
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (!hours) {
        return (
            t?.('profilePage.units.minutesShort', {
                count: remainingMinutes,
            }) || `${remainingMinutes} min`
        );
    }

    if (!remainingMinutes) {
        return (
            t?.('profilePage.units.hoursShort', {
                count: hours,
            }) || `${hours} hr`
        );
    }

    return (
        t?.('profilePage.units.hoursMinutesShort', {
            hours,
            minutes: remainingMinutes,
        }) || `${hours} hr ${remainingMinutes} min`
    );
}

export function formatShortDate(value, fallback = 'Not set') {
    if (!value) {
        return fallback;
    }

    const normalized = String(value).replace(' ', 'T');
    const parsed = dayjs(normalized);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : fallback;
}

export function formatDateTime(value, fallback = 'Not set') {
    if (!value) {
        return fallback;
    }

    const normalized = String(value).replace(' ', 'T');
    const parsed = dayjs(normalized);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : fallback;
}

export function getGoalMessage(todayGoal, t) {
    const target = Number(todayGoal?.targetMinutes || 0);
    const studied = Number(todayGoal?.studiedMinutes || 0);
    const percentage = Number(todayGoal?.percentage || 0);

    if (percentage >= 100) {
        return t
            ? t('profilePage.goalMessages.completed')
            : "You completed today's goal";
    }

    return (
        (t
            ? t('profilePage.goalMessages.remaining', {
                  count: Math.max(target - studied, 0),
              })
            : null) ||
        `${Math.max(target - studied, 0)} min left to reach today's goal`
    );
}

export function normalizeProfilePayload(values) {
    return {
        displayName: values.displayName?.trim(),
        avatarUrl: values.avatarUrl?.trim() || null,
        bio: values.bio?.trim() || null,
        preferredLanguage: normalizeLanguage(
            values.preferredLanguage || getCurrentLanguage()
        ),
        targetIeltsBand:
            values.targetIeltsBand === null ||
            values.targetIeltsBand === undefined
                ? null
                : Number(values.targetIeltsBand),
        targetExamDate: values.targetExamDate
            ? dayjs(values.targetExamDate).format('YYYY-MM-DD')
            : null,
        dailyGoalMinutes:
            values.dailyGoalMinutes === null ||
            values.dailyGoalMinutes === undefined
                ? null
                : Number(values.dailyGoalMinutes),
        weeklyWordGoal:
            values.weeklyWordGoal === null ||
            values.weeklyWordGoal === undefined
                ? null
                : Number(values.weeklyWordGoal),
        preferredSkill: values.preferredSkill?.trim() || null,
    };
}
