const TYPE_VIEW = {
    GRANT: { tone: 'positive', sign: '+', iconKey: 'gift' },
    SPEND: { tone: 'negative', sign: '-', iconKey: 'coins' },
    CAPTURE: { tone: 'negative', sign: '-', iconKey: 'coins' },
    RESERVE: { tone: 'warning', sign: '-', iconKey: 'lock' },
    RELEASE: { tone: 'positive', sign: '+', iconKey: 'rotate' },
    OBSERVATION: { tone: 'neutral', sign: null, iconKey: 'eye' },
};

export function getCreditTransactionView(transaction) {
    const type = transaction?.transactionType || 'UNKNOWN';
    const config = TYPE_VIEW[type];
    const amount = Math.abs(Number(transaction?.amount || 0));
    if (!config) {
        return {
            tone: 'neutral',
            iconKey: 'receipt',
            labelKey: 'credits.transactions.types.UNKNOWN',
            displayAmount: String(amount),
        };
    }
    return {
        tone: config.tone,
        iconKey: config.iconKey,
        labelKey: `credits.transactions.types.${type}`,
        displayAmount: config.sign ? `${config.sign}${amount}` : null,
    };
}

export function normalizeCreditTransactionPage(data, fallbackPage = 0) {
    const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.content)
          ? data.content
          : [];

    return {
        items,
        pageNumber: Number(data?.page ?? data?.pageNumber ?? fallbackPage),
        pageSize: Number(data?.size ?? data?.pageSize ?? 20),
        totalElements: Number(data?.totalElements || 0),
        totalPages: Number(data?.totalPages || 0),
    };
}
