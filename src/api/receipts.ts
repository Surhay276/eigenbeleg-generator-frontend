import type { Receipt, ReceiptInput } from '@/types/receipt'

/** Das Backend hat die Eingaben abgelehnt (HTTP 400); fieldErrors enthält je Feld die Meldung. */
export class ValidationError extends Error {
  constructor(public readonly fieldErrors: Record<string, string>) {
    super('Das Backend hat die Eingaben abgelehnt')
  }
}

// Adresse des Backends: lokal aus .env.development, auf Render aus der Umgebungsvariable
function receiptsUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL ist nicht gesetzt')
  }
  return `${baseUrl.replace(/\/+$/, '')}/api/receipts`
}

/** Lädt alle Belege vom Backend (GET /api/receipts). Wirft einen Fehler, wenn das nicht klappt. */
export async function fetchReceipts(): Promise<Receipt[]> {
  const response = await fetch(receiptsUrl())
  if (!response.ok) {
    throw new Error(`Belege konnten nicht geladen werden (HTTP ${response.status})`)
  }
  return (await response.json()) as Receipt[]
}

/** Speichert einen neuen Beleg (POST /api/receipts) und gibt ihn mit Nummer zurück. */
export async function createReceipt(input: ReceiptInput): Promise<Receipt> {
  const response = await fetch(receiptsUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (response.status === 400) {
    throw new ValidationError((await response.json()) as Record<string, string>)
  }
  if (!response.ok) {
    throw new Error(`Beleg konnte nicht gespeichert werden (HTTP ${response.status})`)
  }
  return (await response.json()) as Receipt
}
