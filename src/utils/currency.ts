export const CURRENCY_SYMBOL = 'F CFA';

/**
 * Formats a number in Franc CFA (e.g., 12 500 F CFA).
 * Franc CFA has no decimal places / centimes in practice, so integers are standard.
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `0 ${CURRENCY_SYMBOL}`;
  }
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('fr-FR')} ${CURRENCY_SYMBOL}`;
}

/**
 * Formats cost per unit with optional decimal support for fractional ingredient weights and unit suffix
 */
export function formatUnitCost(amount: number | undefined | null, unit?: string): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    const formatted = `0 ${CURRENCY_SYMBOL}`;
    return unit ? `${formatted} / ${unit}` : formatted;
  }
  let formatted: string;
  if (Number.isInteger(amount)) {
    formatted = `${amount.toLocaleString('fr-FR')} ${CURRENCY_SYMBOL}`;
  } else {
    formatted = `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ${CURRENCY_SYMBOL}`;
  }
  return unit ? `${formatted} / ${unit}` : formatted;
}
