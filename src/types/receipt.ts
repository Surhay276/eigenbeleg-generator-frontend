// Spiegelt die Entity `Receipt` aus dem Spring-Boot-Backend (htw.webtech2026.Webtech2026.model).

export type ReceiptType = 'ALLGEMEIN' | 'ANKAUF'

export type VatRate = 'REGELSATZ_19' | 'ERMAESSIGT_7' | 'OHNE_UST'

export type PaymentMethod = 'BAR' | 'UEBERWEISUNG' | 'KARTE'

export interface Receipt {
  id: string
  number: string
  type: ReceiptType
  /** ISO-Datum, z. B. "2026-10-01" (Java LocalDate) */
  issueDate: string
  /** ISO-Datum der Zahlung bzw. des Kaufs */
  paymentDate: string
  payeeName: string
  payeeAddress: string | null
  description: string
  /** Bruttobetrag in Cent */
  amountCents: number
  vatRate: VatRate
  reason: string
  paymentMethod: PaymentMethod
  /** ISO-Zeitstempel (Java Instant) */
  createdAt: string
  /** Bleibt bis zum Login null */
  ownerId: string | null
}
