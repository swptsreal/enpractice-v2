import { describe, expect, it } from 'vitest';
import { accountInitial, membershipTierKey, readAvatarUrl } from './accountMenuModel';

/**
 * The header's account block is the ONE place the app reads membership, and the backend enum is
 * `FREE | PREMIUM | PRO | SPECIAL`. These three functions are what stands between `/auth/me` and a
 * learner seeing a raw i18n key or a broken image in the top-right corner of every screen.
 */
describe('membershipTierKey', () => {
    it('maps every backend tier to a literal locale key', () => {
        /* The keys live under `profilePage`, NOT at the top level: `membershipHeader` was authored
           for the profile screen, and the header menu reuses it rather than duplicating four tier
           names. `npm run verify:i18n` caught the top-level path within a minute of it being
           written, which is the argument for literal keys over a template. */
        expect(membershipTierKey('FREE')).toBe('profilePage.membershipHeader.tiers.free.title');
        expect(membershipTierKey('PREMIUM')).toBe('profilePage.membershipHeader.tiers.premium.title');
        expect(membershipTierKey('PRO')).toBe('profilePage.membershipHeader.tiers.pro.title');
        expect(membershipTierKey('SPECIAL')).toBe('profilePage.membershipHeader.tiers.special.title');
    });

    it('accepts the tier in any case, because it arrives from JSON', () => {
        expect(membershipTierKey('premium')).toBe('profilePage.membershipHeader.tiers.premium.title');
    });

    it('falls back to Free for a missing or unknown tier, never to a raw key', () => {
        /* A session restored from storage has no membership fields until `/auth/me` answers, and a
           tier the locale has never heard of must not print a raw key. Free is the fallback rather
           than the highest tier: overstating the plan is worse. */
        expect(membershipTierKey(undefined)).toBe('profilePage.membershipHeader.tiers.free.title');
        expect(membershipTierKey(null)).toBe('profilePage.membershipHeader.tiers.free.title');
        expect(membershipTierKey('GOLD')).toBe('profilePage.membershipHeader.tiers.free.title');
    });
});

describe('readAvatarUrl', () => {
    it('returns a usable url', () => {
        expect(readAvatarUrl({ avatarUrl: 'https://cdn.example.com/a.png' })).toBe(
            'https://cdn.example.com/a.png'
        );
    });

    it('returns null for a new account, an empty string or whitespace', () => {
        /* Verified against the running backend: a fresh account's `avatarUrl` is null. An
           `<img src={null}>` renders the browser's broken-image glyph, so the caller needs null. */
        expect(readAvatarUrl({ avatarUrl: null })).toBeNull();
        expect(readAvatarUrl({ avatarUrl: '' })).toBeNull();
        expect(readAvatarUrl({ avatarUrl: '   ' })).toBeNull();
        expect(readAvatarUrl({})).toBeNull();
        expect(readAvatarUrl(null)).toBeNull();
    });
});

describe('accountInitial', () => {
    it('takes the first letter, uppercased, and survives a missing name', () => {
        expect(accountInitial({ displayName: 'minh anh' })).toBe('M');
        expect(accountInitial({ displayName: '  Zoe' })).toBe('Z');
        expect(accountInitial({ displayName: '' })).toBe('?');
        expect(accountInitial({})).toBe('?');
        expect(accountInitial(null)).toBe('?');
    });
});
