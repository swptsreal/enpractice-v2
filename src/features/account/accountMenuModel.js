/**
 * Model for the header's account block. No JSX, so it can be unit-tested directly.
 *
 * ── WHY A STATIC TIER MAP AND NOT A TEMPLATE KEY ─────────────────────────────
 *
 * `membershipTierKey('PREMIUM')` exists instead of `t(\`membershipHeader.tiers.${tier}.title\`)`
 * for the same reason `features/ielts/useIeltsDetail` and `features/profile/useProfile` keep their
 * label maps: `scripts/i18n-audit.mjs` scans for LITERAL keys, so a template key is invisible to
 * the gate. A renamed key, or a tier the locale does not know, would render `membershipHeader.tiers.…`
 * to a learner instead of failing a check.
 *
 * The backend enum is `MembershipTier` = FREE | PREMIUM | PRO | SPECIAL, and it is read from
 * `GET /auth/me` (`UserDto.membershipTier`), so the input can also be null for a session restored
 * from storage before `/auth/me` answers.
 */

export const MEMBERSHIP_TIER_KEYS = {
    FREE: 'profilePage.membershipHeader.tiers.free.title',
    PREMIUM: 'profilePage.membershipHeader.tiers.premium.title',
    PRO: 'profilePage.membershipHeader.tiers.pro.title',
    SPECIAL: 'profilePage.membershipHeader.tiers.special.title',
};

export const MEMBERSHIP_TIERS = Object.keys(MEMBERSHIP_TIER_KEYS);

/**
 * The i18n key for a tier label.
 *
 * An unknown tier reads as Free rather than as a raw key: a membership the locale has never heard
 * of is not a reason to show the learner `membershipHeader.tiers.gold.title`. The fallback is the
 * LOWEST tier on purpose — inventing a higher one would overstate what the account has.
 */
export function membershipTierKey(tier) {
    const normalized = String(tier ?? 'FREE').toUpperCase();
    return MEMBERSHIP_TIER_KEYS[MEMBERSHIP_TIERS.includes(normalized) ? normalized : 'FREE'];
}

/**
 * The avatar URL, or null when there is nothing to point an `<img>` at.
 *
 * `avatarUrl` IS null for a new account (verified against the running backend), and `<img src={null}>`
 * renders the browser's broken-image glyph, so a caller needs a deterministic fallback rather than
 * a conditional blank.
 */
export function readAvatarUrl(user) {
    const url = user?.avatarUrl;
    return typeof url === 'string' && url.trim() !== '' ? url.trim() : null;
}

/** The avatar's fallback: the first letter of the display name, or `?` when there is none. */
export function accountInitial(user) {
    const name = String(user?.displayName ?? '').trim();
    return name ? name.charAt(0).toUpperCase() : '?';
}
