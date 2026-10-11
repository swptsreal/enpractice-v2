export const MEMBERSHIP_TIERS = ['FREE', 'PREMIUM', 'PRO', 'SPECIAL'];

const MEMBERSHIP_LABELS = {
    FREE: 'Free',
    PREMIUM: 'Premium',
    PRO: 'Pro',
    SPECIAL: 'Special',
};

function normalizeMembershipTier(tier) {
    const normalized = String(tier || 'FREE').toUpperCase();
    return MEMBERSHIP_TIERS.includes(normalized) ? normalized : 'FREE';
}

export function getMembershipBadge(user) {
    const storedTier = normalizeMembershipTier(user?.membershipTier);
    const isActive = user?.membershipActive !== false;

    if (!isActive) {
        return {
            label: MEMBERSHIP_LABELS.FREE,
            tier: 'FREE',
            variant: 'free',
            title: `${storedTier} expired`,
            expiresAt: user?.membershipExpiresAt || null,
            storedTier,
            active: false,
        };
    }

    return {
        label: MEMBERSHIP_LABELS[storedTier],
        tier: storedTier,
        variant: storedTier.toLowerCase(),
        title: user?.membershipExpiresAt
            ? `Expires at ${user.membershipExpiresAt}`
            : 'No expiry',
        expiresAt: user?.membershipExpiresAt || null,
        storedTier,
        active: true,
    };
}
