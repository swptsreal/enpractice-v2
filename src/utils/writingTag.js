const WRITING_TAG_COLORS = {
    primary: 'var(--app-primary)',
    secondary: 'var(--app-secondary)',
    accent: 'var(--app-accent)',
    success: 'var(--app-success)',
    warning: 'var(--app-warning)',
    danger: 'var(--app-danger)',
    neutral: 'var(--app-text-secondary-color)',
};

function withAlpha(color, alpha) {
    const percent = Math.max(0, Math.min(alpha, 1)) * 100;
    return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function createWritingTagStyle(accent, themeTokens) {
    const isDark = themeTokens?.isDark === true;

    return {
        color: accent,
        background: withAlpha(accent, isDark ? 0.18 : 0.1),
        borderColor: withAlpha(accent, isDark ? 0.34 : 0.2),
        fontWeight: 600,
    };
}

export function getWritingTaskTypeTagStyle(taskType, themeTokens) {
    switch (taskType) {
        case 'TASK_2':
            return createWritingTagStyle(WRITING_TAG_COLORS.secondary, themeTokens);
        case 'TASK_1':
        default:
            return createWritingTagStyle(WRITING_TAG_COLORS.primary, themeTokens);
    }
}

export function getWritingDifficultyTagStyle(difficulty, themeTokens) {
    switch (difficulty) {
        case 'EASY':
            return createWritingTagStyle(WRITING_TAG_COLORS.success, themeTokens);
        case 'HARD':
            return createWritingTagStyle(WRITING_TAG_COLORS.danger, themeTokens);
        case 'MEDIUM':
        default:
            return createWritingTagStyle(WRITING_TAG_COLORS.accent, themeTokens);
    }
}

export function getWritingStatusTagStyle(status, themeTokens) {
    switch (status) {
        case 'COMPLETED':
        case 'GRADED':
            return createWritingTagStyle(WRITING_TAG_COLORS.success, themeTokens);
        case 'FAILED':
            return createWritingTagStyle(WRITING_TAG_COLORS.danger, themeTokens);
        case 'GRADING':
            return createWritingTagStyle(WRITING_TAG_COLORS.warning, themeTokens);
        case 'SUBMITTED':
        case 'TASK_2_SUBMITTED':
            return createWritingTagStyle(WRITING_TAG_COLORS.secondary, themeTokens);
        case 'IN_PROGRESS':
        case 'STARTED':
            return createWritingTagStyle(WRITING_TAG_COLORS.primary, themeTokens);
        default:
            return createWritingTagStyle(WRITING_TAG_COLORS.neutral, themeTokens);
    }
}
