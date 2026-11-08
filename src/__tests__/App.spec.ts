import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import App from '../App.vue'
import { sampleReceipts } from '../data/sampleReceipts'

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('App', () => {
  it('zeigt einen Ladehinweis, solange das Backend nicht geantwortet hat', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => new Promise(() => {})),
    )

    const wrapper = mount(App)

    expect(wrapper.find('[data-test="loading"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="receipt-row"]')).toHaveLength(0)
  })

  it('lädt die Belege per GET /api/receipts und zeigt sie an', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sampleReceipts))
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(App)
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/receipts')
    expect(wrapper.find('h1').text()).toBe('Meine Belege')
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="receipt-row"]')).toHaveLength(sampleReceipts.length)
  })

  it('zeigt eine Fehlermeldung und lädt mit „Erneut laden“ neu', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(sampleReceipts))
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('[data-test="error"]').text()).toContain('nicht geladen werden')
    expect(wrapper.findAll('[data-test="receipt-row"]')).toHaveLength(0)

    await wrapper.get('[data-test="error"] button').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[data-test="error"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="receipt-row"]')).toHaveLength(sampleReceipts.length)
  })

  it('behandelt eine Fehlerantwort des Backends wie einen Ladefehler', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 500)))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('[data-test="error"]').exists()).toBe(true)
  })
})
