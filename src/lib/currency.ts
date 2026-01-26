export const CURRENCY_SYMBOL = 'E£';

/**
 * Formats a number as Egyptian currency
 * @param amount - The numerical amount to format
 * @returns Formatted string with currency symbol
 */
export function formatCurrency(amount: number): string {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-EG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Splits price into whole and fractional parts for specialized Amazon-style styling
 */
export function splitPrice(price: number) {
    const whole = Math.floor(price);
    const fraction = (price % 1).toFixed(2).substring(1); // gets ".XX" then "XX"
    return { whole, fraction: fraction === '.00' ? '00' : fraction.substring(1) };
}
