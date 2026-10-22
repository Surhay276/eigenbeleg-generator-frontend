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
