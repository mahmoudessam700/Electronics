// @ts-nocheck
const { getPool } = require('./db');
const { generateId } = require('./auth');

const LEDGER_TYPE_ORDER = 'ORDER_EARNING';
const LEDGER_TYPE_REVERSAL = 'REVERSAL';
const LEDGER_TYPE_PAYOUT = 'PAYOUT';

const getExecutor = (client) => client || getPool();

const getLatestBalance = async (executor, shopId) => {
    if (!shopId) return 0;
    const [rows] = await executor.execute(
        `
        SELECT balanceAfter
        FROM ShopCommissionLedger
        WHERE shopId = ?
        ORDER BY createdAt DESC, id DESC
        LIMIT 1
    `,
        [shopId],
    );
    const latest = rows[0];
    if (!latest) return 0;
    if (typeof latest.balanceAfter === 'number') {
        return latest.balanceAfter;
    }
    return 0;
};

const recordOrderLedgerEntries = async (
    client,
    { shopId, orderId, orderNumber, items = [], entryType = LEDGER_TYPE_ORDER }
) => {
    if (!shopId || !Array.isArray(items) || items.length === 0) {
        return [];
    }

    const executor = getExecutor(client);
    let runningBalance = await getLatestBalance(executor, shopId);
    const reference = orderNumber || orderId || null;
    const inserted = [];
    const isReversal = entryType === LEDGER_TYPE_REVERSAL;

    for (const item of items) {
        const amount = Number(item.netRevenue) || 0;
        if (!Number.isFinite(amount) || amount === 0) {
            continue;
        }

        const signedAmount = isReversal ? -amount : amount;
        runningBalance += signedAmount;
        const ledgerId = generateId('led');
        const metadata = {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            commissionRate: item.commissionRate,
            commissionAmount: item.commissionAmount,
            entryType,
        };
        const descriptor = isReversal ? 'Reversal' : `${item.quantity || 1}x sale`;

        await executor.execute(
            `
            INSERT INTO ShopCommissionLedger (
                id, shopId, orderId, orderItemId, productId,
                type, amount, balanceAfter, description, reference, metadata
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [
                ledgerId,
                shopId,
                orderId || null,
                item.id || null,
                item.productId || null,
                entryType,
                signedAmount,
                runningBalance,
                `${descriptor} for order ${reference || 'unreferenced'}`,
                reference,
                JSON.stringify(metadata),
            ],
        );

        inserted.push({ id: ledgerId, amount: signedAmount, balanceAfter: runningBalance });
    }

    return inserted;
};

const recordPayoutLedgerEntry = async (
    client,
    { shopId, payoutId, amount, reference, description, metadata = {}, direction = 'DEBIT' }
) => {
    if (!shopId || !Number.isFinite(Number(amount))) {
        return null;
    }

    const executor = getExecutor(client);
    const numericAmount = Math.abs(Number(amount));
    const normalizedDirection = direction === 'CREDIT' ? 'CREDIT' : 'DEBIT';
    let runningBalance = await getLatestBalance(executor, shopId);
    const signedAmount = normalizedDirection === 'CREDIT' ? numericAmount : -numericAmount;
    runningBalance += signedAmount;
    const ledgerId = generateId('led');

    const payload = {
        payoutId,
        reference,
        direction: normalizedDirection,
        ...metadata,
    };

    await executor.execute(
        `
        INSERT INTO ShopCommissionLedger (
            id, shopId, payoutId, type, amount, balanceAfter, description, reference, metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [
            ledgerId,
            shopId,
            payoutId || null,
            LEDGER_TYPE_PAYOUT,
            signedAmount,
            runningBalance,
            description || `Payout ${reference || payoutId || ''}`.trim(),
            reference || payoutId || null,
            JSON.stringify(payload),
        ],
    );

    return { id: ledgerId, amount: signedAmount, balanceAfter: runningBalance };
};

module.exports = {
    getLatestBalance,
    recordOrderLedgerEntries,
    recordPayoutLedgerEntry,
    LEDGER_TYPE_ORDER,
    LEDGER_TYPE_REVERSAL,
    LEDGER_TYPE_PAYOUT,
};
