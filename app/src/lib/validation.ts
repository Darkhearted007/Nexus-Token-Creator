/** Strips HTML-injectable characters to prevent XSS in stored strings. */
export function sanitizeString(str: string): string {
  return str.replace(/[<>"'`]/g, "").trim();
}

/** Returns true if the URL is a valid https:// URL. */
export function isValidHttpsUrl(url: string): boolean {
  if (!url) return true; // optional fields are allowed to be empty
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates all token form fields and returns an array of error messages. */
export interface TokenFormValues {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  website?: string;
  twitter?: string;
  telegram?: string;
}

export function validateTokenForm(form: TokenFormValues): string[] {
  const errors: string[] = [];

  const name = form.name.trim();
  if (!name) errors.push("Token Name is required.");
  else if (name.length > 64)
    errors.push("Token Name must be 64 characters or less.");

  const symbol = form.symbol.trim();
  if (!symbol) errors.push("Ticker Symbol is required.");
  else if (symbol.length > 12)
    errors.push("Ticker Symbol must be 12 characters or less.");
  else if (!/^[A-Za-z0-9_]+$/.test(symbol))
    errors.push(
      "Ticker Symbol can only contain letters, numbers, and underscores."
    );

  if (
    !Number.isInteger(form.decimals) ||
    form.decimals < 0 ||
    form.decimals > 18
  )
    errors.push("Decimals must be a whole number between 0 and 18.");

  if (!Number.isFinite(form.supply) || form.supply <= 0)
    errors.push("Supply must be a positive number.");

  if (form.supply > Number.MAX_SAFE_INTEGER)
    errors.push("Supply is too large. Please use a smaller number.");

  if (form.website && !isValidHttpsUrl(form.website))
    errors.push("Website must be a valid https:// URL.");

  if (form.twitter && !isValidHttpsUrl(form.twitter))
    errors.push("Twitter must be a valid https:// URL.");

  if (form.telegram && !isValidHttpsUrl(form.telegram))
    errors.push("Telegram must be a valid https:// URL.");

  return errors;
}
