const resolveCommissionRate = (productRate, shopRate) => {
    const toNumber = (value) => {
        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
            return null;
        }
        return parsed;
    };

    const product = toNumber(productRate);
    if (product !== null) return product;
    const shop = toNumber(shopRate);
    if (shop !== null) return shop;
    return 0;
};

const calculateCommission = (price, productRate, shopRate) => {
    const safePrice = Number(price) || 0;
    const rate = resolveCommissionRate(productRate, shopRate);
    const commissionAmount = safePrice * (rate / 100);
    return {
        rate,
        commissionAmount,
        displayPrice: safePrice + commissionAmount,
    };
};

module.exports = {
    calculateCommission,
};
