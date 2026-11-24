import { afterEach, describe, expect, it, vi } from 'vitest'

import { createReceipt, fetchReceipts, ValidationError } from '../receipts'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('fetchReceipts', () => {
  it('ruft /api/receipts unter der konfigurierten Adresse auf, auch mit / am Ende', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://backend.example/')
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchReceipts()).resolves.toEqual([])
    expect(fetchMock).toHaveBeenCalledWith('https://backend.example/api/receipts')
  })

  it('wirft einen verständlichen Fehler, wenn die Adresse fehlt', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    vi.stubGlobal('fetch', vi.fn<typeof fetch>())

    await expect(fetchReceipts()).rejects.toThrow('VITE_API_BASE_URL ist nicht gesetzt')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('wirft bei einer Fehlerantwort und nennt den HTTP-Status', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://backend.example')
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 503 })),
    )

    await expect(fetchReceipts()).rejects.toThrow('HTTP 503')
  })
})

describe('createReceipt', () => {
  const input = {
    type: 'ALLGEMEIN',
    issueDate: '2026-10-01',
    paymentDate: '2026-09-30',
    payeeName: 'Parkhaus',
    payeeAddress: null,
    description: 'Parken',
    amountCents: 450,
    vatRate: 'REGELSATZ_19',
    reason: 'Keine Quittung',
    paymentMethod: 'BAR',
  } as const

  it('schickt den Beleg als JSON per POST und gibt den gespeicherten Beleg zurück', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://backend.example')
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{"number":"EB-2026-0001"}', { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createReceipt(input)).resolves.toEqual({ number: 'EB-2026-0001' })
    expect(fetchMock).toHaveBeenCalledWith('https://backend.example/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  })

  it('wirft bei HTTP 400 einen ValidationError mit den Feldmeldungen', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://backend.example')
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response('{"amountCents":"zu klein"}', { status: 400 })),
    )

    const error = await createReceipt(input).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect((error as ValidationError).fieldErrors).toEqual({ amountCents: 'zu klein' })
  })

  it('wirft bei anderen Fehlern einen Fehler mit HTTP-Status', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://backend.example')
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 500 })),
    )

    await expect(createReceipt(input)).rejects.toThrow('HTTP 500')
  })
})
