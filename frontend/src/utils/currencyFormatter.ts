/**
 * Formats a numeric amount with the es-AR locale, always showing two decimals.
 * Example: 24300 -> "24.300,00", 1500.5 -> "1.500,50".
 */
export const formatMoney = (amount: number): string =>
  new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
