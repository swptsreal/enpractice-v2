import { withAlpha } from '../theme/themeTokens';

const APP_VARS = {
    canvas: 'var(--app-canvas)',
    panel: 'var(--app-panel-background)',
    panelStrong: 'var(--app-panel-strong-background)',
    elevated: 'var(--app-elevated-background)',
    frosted: 'var(--app-frosted-background)',
    borderStrong: 'var(--app-border-strong)',
    borderSubtle: 'var(--app-border-subtle)',
    shadowCard: 'var(--app-shadow-card)',
};

const APP_COLORS = {
    primary: 'var(--app-primary)',
    primaryStrong: 'var(--app-primary-strong)',
    secondary: 'var(--app-secondary)',
    accent: 'var(--app-accent)',
    success: 'var(--app-success)',
    warning: 'var(--app-warning)',
    danger: 'var(--app-danger)',
};

function gradient(...colors) {
    return `linear-gradient(135deg, ${colors.join(', ')})`;
}

function mixSurface(surface, color, ratio = 14) {
    return `color-mix(in srgb, ${surface} ${100 - ratio}%, ${color} ${ratio}%)`;
}

function heroBackground(primary, secondary, accent) {
    return `linear-gradient(135deg, ${mixSurface(
        APP_VARS.canvas,
        primary,
        12
    )} 0%, ${mixSurface(APP_VARS.canvas, secondary, 8)} 42%, ${mixSurface(
        APP_VARS.canvas,
        APP_COLORS.primaryStrong,
        4
    )} 70%, ${mixSurface(APP_VARS.canvas, accent, 10)} 100%)`;
}

function overlay(primary, secondary) {
    return `radial-gradient(circle_at_top_right, ${withAlpha(primary, 0.14)}, transparent 32%), radial-gradient(circle_at_left, ${withAlpha(
        secondary,
        0.12
    )}, transparent 28%)`;
}

function shadow(color, alpha = 0.16, size = '0 22px 64px') {
    return `${size} ${withAlpha(color, alpha)}`;
}

function softSurface(primary, secondary) {
    return gradient(
        withAlpha(primary, 0.14),
        APP_VARS.elevated,
        withAlpha(secondary, 0.12)
    );
}

function successSurface() {
    return gradient(
        withAlpha('#10b981', 0.16),
        APP_VARS.panelStrong,
        withAlpha('#34d399', 0.12)
    );
}

function errorSurface() {
    return gradient(
        withAlpha('#ef4444', 0.16),
        APP_VARS.panelStrong,
        withAlpha('#fb7185', 0.12)
    );
}

function createBasePalette({ primary, secondary, accent, surface }) {
    return {
        primary,
        secondary,
        accent,
        surface,
        hero: {
            background: 'var(--app-hero-background)',
            shadow: 'var(--app-shadow-shell)',
            blobs: {
                left: 'var(--app-hero-blob-left)',
                right: 'var(--app-hero-blob-right)',
                bottom: 'var(--app-hero-blob-bottom)',
            },
            badge: primary,
            iconGradient: 'var(--app-hero-icon-background)',
        },
        stat: {
            shadow: APP_VARS.shadowCard,
        },
        stats: {
            shadow: APP_VARS.shadowCard,
        },
        panel: {
            background: APP_VARS.panel,
            border: APP_VARS.borderStrong,
            shadow: shadow(primary, 0.12),
            overlay: overlay(primary, secondary),
        },
        section: {
            background: APP_VARS.panel,
            border: APP_VARS.borderStrong,
            shadow: shadow(primary, 0.12),
            overlay: overlay(primary, surface),
        },
        inputCard: {
            background: APP_VARS.panelStrong,
            border: APP_VARS.borderStrong,
            shadow: shadow(primary, 0.1, '0 14px 34px'),
        },
        result: {
            successBackground: successSurface(),
            errorBackground: errorSurface(),
            successShadow: shadow('#10b981', 0.18, '0 18px 44px'),
            errorShadow: shadow('#ef4444', 0.16, '0 18px 44px'),
            headerGradient: gradient(primary, secondary, accent),
            headerShadow: shadow(primary, 0.24, '0 26px 56px'),
            correct: '#10b981',
            incorrect: '#ef4444',
        },
        action: {
            primaryGradient: 'var(--app-action-primary-background)',
            primaryShadow: 'var(--app-action-primary-shadow)',
            secondaryShadow: APP_VARS.shadowCard,
        },
        empty: {
            iconBackground: softSurface(primary, surface),
            iconShadow: shadow(primary, 0.14, '0 14px 28px'),
            ctaGradient: 'var(--app-action-primary-background)',
            ctaShadow: 'var(--app-action-primary-shadow)',
        },
        history: {
            filterShadow: shadow(primary, 0.12, '0 18px 48px'),
            tableShadow: shadow(primary, 0.12, '0 20px 56px'),
            shadow: shadow(primary, 0.12, '0 18px 60px'),
            statusCorrect: '#059669',
            statusIncorrect: '#e11d48',
        },
        card: {
            background: APP_VARS.panelStrong,
            border: APP_VARS.borderStrong,
            shadow: shadow(primary, 0.12, '0 16px 42px'),
            hoverShadow: shadow(primary, 0.18, '0 24px 60px'),
            overlay: overlay(primary, surface),
            metaBorder: APP_VARS.borderSubtle,
            metaBackground: APP_VARS.frosted,
            divider: APP_VARS.borderSubtle,
            titleHover: primary,
            score: surface,
            practiceBorder: withAlpha(surface, 0.42),
            practiceText: surface,
            practiceShadow: shadow(surface, 0.16, '0 8px 18px'),
            conversationGradient: gradient(primary, secondary, accent),
            conversationShadow: shadow(primary, 0.24, '0 12px 24px'),
        },
        list: {
            shadow: shadow(primary, 0.12, '0 18px 60px'),
            eyebrow: primary,
        },
        toolbar: {
            shadow: shadow(primary, 0.12, '0 18px 60px'),
            overlay: overlay(accent, primary),
        },
        shell: {
            shadow: shadow(primary, 0.12, '0 18px 60px'),
            overlay: overlay(primary, surface),
        },
        skeleton: {
            shadow: shadow(primary, 0.12, '0 18px 60px'),
        },
        practice: {
            promptGradient: gradient(primary, secondary, accent),
            promptShadow: shadow(primary, 0.24, '0 24px 48px'),
            resultSuccess: successSurface(),
            resultError: errorSurface(),
        },
        chart: {
            correct: '#10b981',
            incorrect: '#ef4444',
        },
    };
}

function withOverrides(base, overrides) {
    return {
        ...base,
        ...overrides,
        hero: { ...base.hero, ...(overrides.hero || {}) },
        stat: { ...base.stat, ...(overrides.stat || {}) },
        stats: { ...base.stats, ...(overrides.stats || {}) },
        panel: { ...base.panel, ...(overrides.panel || {}) },
        section: { ...base.section, ...(overrides.section || {}) },
        inputCard: { ...base.inputCard, ...(overrides.inputCard || {}) },
        result: { ...base.result, ...(overrides.result || {}) },
        action: { ...base.action, ...(overrides.action || {}) },
        empty: { ...base.empty, ...(overrides.empty || {}) },
        history: { ...base.history, ...(overrides.history || {}) },
        card: { ...base.card, ...(overrides.card || {}) },
        list: { ...base.list, ...(overrides.list || {}) },
        toolbar: { ...base.toolbar, ...(overrides.toolbar || {}) },
        shell: { ...base.shell, ...(overrides.shell || {}) },
        skeleton: { ...base.skeleton, ...(overrides.skeleton || {}) },
        practice: { ...base.practice, ...(overrides.practice || {}) },
        chart: { ...base.chart, ...(overrides.chart || {}) },
    };
}

function createPalette(config, overrides = {}) {
    return withOverrides(createBasePalette(config), overrides);
}

function createCustomSpeakingPalette() {
    return createPalette(
        {
            primary: APP_COLORS.secondary,
            secondary: APP_COLORS.accent,
            accent: APP_COLORS.primary,
            surface: APP_COLORS.success,
        },
        {
            panel: {
                shadow: shadow(APP_COLORS.secondary, 0.16, '0 24px 70px'),
            },
            section: {
                shadow: shadow(APP_COLORS.secondary, 0.12, '0 14px 32px'),
            },
            action: {
                gradient: gradient(
                    APP_COLORS.secondary,
                    APP_COLORS.accent,
                    APP_COLORS.primary
                ),
                shadow: shadow(APP_COLORS.secondary, 0.24, '0 20px 38px'),
                secondaryBorder: withAlpha(APP_COLORS.secondary, 0.38),
                secondaryText: APP_COLORS.secondary,
            },
            switchCard: {
                background: softSurface(
                    APP_COLORS.secondary,
                    APP_COLORS.primary
                ),
                border: APP_VARS.borderStrong,
                shadow: shadow(APP_COLORS.secondary, 0.1, '0 14px 28px'),
            },
            form: {
                background: APP_VARS.panel,
                shadow: shadow(APP_COLORS.secondary, 0.14, '0 24px 70px'),
                overlay: overlay(APP_COLORS.accent, APP_COLORS.primary),
            },
        }
    );
}

export const PAGE_PALETTES = {
    profile: createPalette({
        primary: APP_COLORS.primary,
        secondary: APP_COLORS.secondary,
        accent: APP_COLORS.accent,
        surface: APP_COLORS.success,
    }),
    dashboard: createPalette({
        primary: APP_COLORS.primary,
        secondary: APP_COLORS.secondary,
        accent: APP_COLORS.success,
        surface: APP_COLORS.warning,
    }),
    dictionary: createPalette({
        primary: APP_COLORS.primary,
        secondary: APP_COLORS.secondary,
        accent: APP_COLORS.success,
        surface: APP_COLORS.warning,
    }),
    vocabularyTest: createPalette({
        primary: APP_COLORS.primary,
        secondary: APP_COLORS.secondary,
        accent: APP_COLORS.accent,
        surface: APP_COLORS.success,
    }),
    vocabularyCheck: createPalette({
        primary: APP_COLORS.primary,
        secondary: APP_COLORS.secondary,
        accent: APP_COLORS.accent,
        surface: APP_COLORS.success,
    }),
    review: createPalette(
        {
            primary: APP_COLORS.primary,
            secondary: APP_COLORS.success,
            accent: APP_COLORS.secondary,
            surface: APP_COLORS.accent,
        },
        {
            practice: {
                stageBackground: APP_VARS.panelStrong,
            },
        }
    ),
    evaluation: createPalette(
        {
            primary: APP_COLORS.primary,
            secondary: APP_COLORS.secondary,
            accent: APP_COLORS.accent,
            surface: APP_COLORS.success,
        },
        {
            level: {
                urgent: APP_COLORS.danger,
                improve: APP_COLORS.warning,
                watch: APP_COLORS.accent,
            },
        }
    ),
    ielts: createPalette({
        primary: APP_COLORS.primary,
        secondary: APP_COLORS.success,
        accent: APP_COLORS.warning,
        surface: APP_COLORS.secondary,
    }),
    speaking: createPalette(
        {
            primary: APP_COLORS.primary,
            secondary: APP_COLORS.secondary,
            accent: APP_COLORS.accent,
            surface: APP_COLORS.success,
        },
        {
            custom: createCustomSpeakingPalette(),
        }
    ),
    writing: createPalette(
        {
            primary: APP_COLORS.primary,
            secondary: APP_COLORS.secondary,
            accent: APP_COLORS.accent,
            surface: APP_COLORS.success,
        },
        {
            taskType: {
                TASK_1: {
                    color: APP_COLORS.primary,
                    soft: withAlpha(APP_COLORS.primary, 0.16),
                },
                TASK_2: {
                    color: APP_COLORS.secondary,
                    soft: withAlpha(APP_COLORS.secondary, 0.16),
                },
            },
        }
    ),
    leaderboard: createPalette({
        primary: APP_COLORS.primary,
        secondary: APP_COLORS.success,
        accent: APP_COLORS.warning,
        surface: APP_COLORS.secondary,
    }),
    landing: createPalette({
        primary: APP_COLORS.primary,
        secondary: APP_COLORS.secondary,
        accent: APP_COLORS.accent,
        surface: APP_COLORS.success,
    }),
};

export function getPagePalette(pageKey) {
    return PAGE_PALETTES[pageKey] || PAGE_PALETTES.profile;
}
