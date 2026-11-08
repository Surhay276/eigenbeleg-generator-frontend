import type { Receipt } from '@/types/receipt'

/** Lädt alle Belege vom Backend (GET /api/receipts). Wirft einen Fehler, wenn das nicht klappt. */
export async function fetchReceipts(): Promise<Receipt[]> {
  // Adresse des Backends: lokal aus .env.development, auf Render aus der Umgebungsvariable
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL ist nicht gesetzt')
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/receipts`)
  if (!response.ok) {
    throw new Error(`Belege konnten nicht geladen werden (HTTP ${response.status})`)
  }
  return (await response.json()) as Receipt[]
}
