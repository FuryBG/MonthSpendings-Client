export type ParsedWalletNotification = {
  merchantName: string
  amount: number
  currency: string
  rawTitle: string
  rawBody: string
}

export const GOOGLE_WALLET_PACKAGES = [
  'com.google.android.apps.walletnfcrel',
  'com.google.android.gms',
  ...(__DEV__ ? ['app.expo.tavira'] : []),
]

function detectCurrency(symbol: string, codeHint: string, body: string): string {
  if (symbol === '€' || codeHint === 'EUR' || /\bEUR\b/i.test(body)) return 'EUR'
  if (symbol === '$' || codeHint === 'USD' || /\bUSD\b/i.test(body)) return 'USD'
  if (symbol === '£' || codeHint === 'GBP' || /\bGBP\b/i.test(body)) return 'GBP'
  if (symbol === '₺' || codeHint === 'TRY' || /\bTRY\b/i.test(body)) return 'TRY'
  if (symbol === '₾' || codeHint === 'GEL' || /\bGEL\b/i.test(body)) return 'GEL'
  if (codeHint === 'BGN' || /\bBGN\b|лв/i.test(body)) return 'BGN'
  return 'BGN'
}

// Patterns tried in order. Each must capture: [symbol?, amount] or [amount, currencyCode]
const AMOUNT_PATTERNS: readonly { re: RegExp; symbolGroup: number; amountGroup: number; codeGroup?: number }[] = [
  // €5.50 or €5,50 at start — confirmed Google Wallet / DSK format
  { re: /^([€$£₺₴₽₾])\s*([\d]+[.,][\d]{1,2})/, symbolGroup: 1, amountGroup: 2 },
  // лв 5.50 — Bulgarian lev text prefix
  { re: /^лв\.?\s*([\d]+[.,][\d]{1,2})/, symbolGroup: -1, amountGroup: 1 },
  // 5.50 BGN or 5,50 EUR anywhere — code after amount
  { re: /([\d]+[.,][\d]{1,2})\s+([A-Z]{3})\b/, symbolGroup: -1, amountGroup: 1, codeGroup: 2 },
]

export function parseWalletNotification(
  title: string | null | undefined,
  text: string | null | undefined,
): ParsedWalletNotification | null {
  if (!title || !text) return null
  const body = text.trim()

  for (const { re, symbolGroup, amountGroup, codeGroup } of AMOUNT_PATTERNS) {
    const match = body.match(re)
    if (!match) continue
    const amount = parseFloat(match[amountGroup].replace(',', '.'))
    if (isNaN(amount) || amount <= 0) continue
    const symbol = symbolGroup !== -1 ? (match[symbolGroup] ?? '') : ''
    const code = codeGroup ? (match[codeGroup] ?? '') : ''
    return {
      merchantName: title.trim(),
      amount,
      currency: detectCurrency(symbol, code, body),
      rawTitle: title,
      rawBody: text,
    }
  }

  return null
}
