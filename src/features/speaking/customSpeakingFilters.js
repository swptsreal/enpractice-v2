/**
 * The four shelves of the custom-speaking template list (screen 27).
 *
 * The list opens on IELTS rather than an "everything" view: the curated catalogue is mostly
 * IELTS, and a mixed list made the first screen noisier than the default the learner needs.
 * "Của tôi" is a SOURCE, not a theme: it selects `source === 'USER'`, while the other three
 * select the template's `group`. Kept out of the picker component so the module exports only
 * components (the fast-refresh rule) and so the page can validate `?filter=`.
 */
export const TEMPLATE_FILTERS = [
    { id: 'IELTS', labelKey: 'customSpeaking.filter.ielts' },
    { id: 'DAILY', labelKey: 'customSpeaking.filter.daily' },
    { id: 'BASIC', labelKey: 'customSpeaking.filter.basic' },
    { id: 'mine', labelKey: 'customSpeaking.filter.mine' },
];

export const DEFAULT_TEMPLATE_FILTER = 'IELTS';

export function isTemplateFilter(value) {
    return TEMPLATE_FILTERS.some((option) => option.id === value);
}
