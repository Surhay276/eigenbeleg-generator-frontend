import type { PaymentMethod, ReceiptType, VatRate } from '@/types/receipt'

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })

/** 450 -> "4,50 €" */
export function formatCents(cents: number): string {
  return euro.format(cents / 100)
}

/** "2026-09-30" -> "30.09.2026" (ohne Zeitzonen-Umrechnung) */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

export const receiptTypeLabel: Record<ReceiptType, string> = {
  ALLGEMEIN: 'Allgemein',
  ANKAUF: 'Ankauf',
}

export const vatRateLabel: Record<VatRate, string> = {
  REGELSATZ_19: '19 % USt',
  ERMAESSIGT_7: '7 % USt',
  OHNE_UST: 'ohne USt',
}

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  BAR: 'Bar',
  UEBERWEISUNG: 'Überweisung',
  KARTE: 'Karte',
}

/** "4,50" -> 450, "12" -> 1200, "0,5" -> 50; null, wenn die Eingabe kein Betrag ist. Rechnet ohne Kommazahlen, damit nichts gerundet wird. */
export function parseEuroToCents(input: string): number | null {
  const match = /^(\d+)(?:[,.](\d{1,2}))?$/.exec(input.replace(/[\s€]/g, ''))
  if (!match) return null
  return Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'))
}
