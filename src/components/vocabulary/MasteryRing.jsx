import { useTranslation } from 'react-i18next';

/**
 * Mastery ring — an SVG arc showing how well ONE word is remembered.
 *
 * A ring, not a bar: the value is a per-item state, not progress through a
 * sequence, and a bar would read as "3 of 5 steps done" when it actually means
 * "this word is currently at level 3 of 5".
 *
 * Three things this deliberately does that a naive ring does not:
 *
 *  1. It is tinted by memory TIER, and the tier is also stated in text
 *     ("Đang học", "Đã nhớ"). A colour-only signal fails WCAG 2.1 SC 1.4.1, and
 *     this is exactly the kind of metric where colour is the whole message.
 *  2. It renders `role="img"` with an `aria-label` carrying the value, because an
 *     SVG arc is otherwise invisible to assistive tech.
 *  3. At `size="sm"` the label is dropped but the accessible name is not, so a
 *     dense list row stays readable and still announced.
 *
 * `proficiencyLevel` is 0-5 on the backend (verified: PATCH
 * /dictionary/{id}/review with performanceScore 0-5 moves it 0 -> 2), so the ring
 * divides by 5 rather than by 100.
 */
const LEVELS = 5;

export function MasteryRing({ level = 0, size = 'md', showLabel = true, className }) {
    const { t } = useTranslation();

    const clamped = Math.max(0, Math.min(LEVELS, Number(level) || 0));
    const ratio = clamped / LEVELS;
    const percent = Math.round(ratio * 100);

    const dimensions = { sm: 40, md: 56, lg: 88 }[size] ?? 56;
    const stroke = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
    const radius = (dimensions - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    /* Thresholds from the approved design: below 50 wrong, 50-75 amber, above teal. */
    const tier = percent < 50 ? 'low' : percent <= 75 ? 'mid' : 'high';
    const tierVar = { low: 'var(--wrong)', mid: 'var(--amber)', high: 'var(--teal)' }[tier];
    const tierLabel = { low: 'dictionary.tierLow', mid: 'dictionary.tierMid', high: 'dictionary.tierHigh' }[tier];

    return (
        <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg
                width={dimensions}
                height={dimensions}
                viewBox={`0 0 ${dimensions} ${dimensions}`}
                role="img"
                aria-label={t('dictionary.masteryAria', { level: clamped, total: LEVELS, tier: t(tierLabel) })}
                style={{ flexShrink: 0 }}
            >
                {/* the track */}
                <circle
                    cx={dimensions / 2}
                    cy={dimensions / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={stroke}
                />
                {/* the arc: dasharray = filled,offset = remainder, rotated to 12 o'clock */}
                <circle
                    cx={dimensions / 2}
                    cy={dimensions / 2}
                    r={radius}
                    fill="none"
                    stroke={tierVar}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference * ratio} ${circumference}`}
                    transform={`rotate(-90 ${dimensions / 2} ${dimensions / 2})`}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={tierVar}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: size === 'lg' ? '1.25rem' : '0.8125rem', fontWeight: 700 }}
                >
                    {percent}%
                </text>
            </svg>

            {showLabel ? (
                <span className="t-micro" style={{ color: tierVar }}>
                    {t(tierLabel)}
                </span>
            ) : null}
        </span>
    );
}

export default MasteryRing;
