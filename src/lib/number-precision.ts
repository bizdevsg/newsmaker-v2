const countDecimals = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const dotIndex = trimmed.indexOf(".");
  return dotIndex === -1 ? 0 : Math.max(0, trimmed.length - dotIndex - 1);
};

/**
 * Infers how many decimal places to display results with, based on the
 * precision the user actually typed (e.g. "1.1650" -> 4 for a forex pair).
 * Falls back to `min` for instruments like Gold ("4600" -> 2 decimals), and
 * caps at `max` so a fat-fingered extra digit doesn't blow up the table.
 */
export const inferDecimalPlaces = (
  rawValues: string[],
  { min = 2, max = 6 }: { min?: number; max?: number } = {},
) => {
  const decimals = rawValues.reduce(
    (highest, value) => Math.max(highest, countDecimals(value)),
    0,
  );
  return Math.min(max, Math.max(min, decimals));
};

// Always a dot decimal and no thousands separator, whatever the page locale,
// so results read like the prices in the OHLC table (e.g. 4027.67).
export const createNumberFormatter = (decimals: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false,
  });
