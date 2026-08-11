export type ParsedWalletNotification = {
  merchantName: string
  amount: number
  currency: string
  rawTitle: string
  rawBody: string
}

function detectCurrency(symbol: string, body: string): string {
  if (symbol === '€' || /\bEUR\b/i.test(body)) return 'EUR'
  if (symbol === '$' || /\bUSD\b/i.test(body)) return 'USD'
  if (symbol === '£' || /\bGBP\b/i.test(body)) return 'GBP'
  if (symbol === '₺' || /\bTRY\b/i.test(body)) return 'TRY'
  if (/\bBGN\b|лв/i.test(body)) return 'BGN'
  return 'BGN'
}

export function parseWalletNotification(
  title: string | null | undefined,
  text: string | null | undefined,
): ParsedWalletNotification | null {
  if (!title || !text) return null
  const body = text.trim()
  const match = body.match(/^([€$£₺₴₽]?)\s*([\d]+[.,][\d]{1,2})/)
  if (!match) return null
  const amount = parseFloat(match[2].replace(',', '.'))
  if (isNaN(amount) || amount <= 0) return null
  return {
    merchantName: title.trim(),
    amount,
    currency: detectCurrency(match[1], body),
    rawTitle: title,
    rawBody: text,
  }
}
