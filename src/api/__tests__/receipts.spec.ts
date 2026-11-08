import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchReceipts } from '../receipts'

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
