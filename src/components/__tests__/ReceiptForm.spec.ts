import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import ReceiptForm from '../ReceiptForm.vue'
import type { ReceiptType } from '@/types/receipt'

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mountForm(type: ReceiptType) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'receipts', component: { template: '<p />' } },
      { path: '/belege/neu', name: 'new-receipt', component: ReceiptForm },
    ],
  })
  const push = vi.spyOn(router, 'push')
  const wrapper = mount(ReceiptForm, { props: { type }, global: { plugins: [router] } })
  return { wrapper, push }
}

async function fillRequiredFields(wrapper: ReturnType<typeof mountForm>['wrapper']) {
  await wrapper.get('[name="paymentDate"]').setValue('2026-09-30')
  await wrapper.get('[name="issueDate"]').setValue('2026-10-01')
  await wrapper.get('[name="payeeName"]').setValue('Parkhaus Mitte GmbH')
  await wrapper.get('[name="description"]').setValue('Parkgebühr Kundentermin')
  await wrapper.get('[name="amount"]').setValue('4,50')
  await wrapper.get('[name="reason"]').setValue('Parkautomat gab keine Quittung aus')
}

const today = new Date().toLocaleDateString('sv-SE')

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('ReceiptForm', () => {
  it('belegt den allgemeinen Eigenbeleg mit heute, 19 % und bar vor (UC-03)', () => {
    const { wrapper } = mountForm('ALLGEMEIN')

    expect(wrapper.find('h1').text()).toBe('Neuer Eigenbeleg')
    expect((wrapper.get('[name="issueDate"]').element as HTMLInputElement).value).toBe(today)
    expect((wrapper.get('[name="vatRate"]').element as HTMLSelectElement).value).toBe(
      'REGELSATZ_19',
    )
    expect((wrapper.get('[name="paymentMethod"]').element as HTMLSelectElement).value).toBe('BAR')
    expect((wrapper.get('[name="reason"]').element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.get('[name="payeeAddress"]').attributes('required')).toBeUndefined()
  })

  it('zeigt beim Ankaufbeleg Verkäufer-Felder, ohne USt und den vorausgefüllten Grund (UC-04)', async () => {
    const { wrapper } = mountForm('ANKAUF')

    expect(wrapper.find('h1').text()).toBe('Neuer Ankaufbeleg')
    expect(wrapper.text()).toContain('Name des Verkäufers')
    expect(wrapper.get('[name="payeeAddress"]').attributes('required')).toBeDefined()
    expect((wrapper.get('[name="vatRate"]').element as HTMLSelectElement).value).toBe('OHNE_UST')
    expect((wrapper.get('[name="reason"]').element as HTMLTextAreaElement).value).toBe(
      'Ankauf von Privatperson ohne Rechnung',
    )
    expect(wrapper.find('[data-test="vat-hint"]').exists()).toBe(false)

    await wrapper.get('[name="vatRate"]').setValue('REGELSATZ_19')
    expect(wrapper.find('[data-test="vat-hint"]').exists()).toBe(true)
  })

  it('schickt den Beleg mit dem Betrag in Cent und kehrt mit der Belegnummer zur Liste zurück', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ number: 'EB-2026-0004' }, 201))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, push } = mountForm('ALLGEMEIN')

    await fillRequiredFields(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('http://localhost:8080/api/receipts')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      type: 'ALLGEMEIN',
      paymentDate: '2026-09-30',
      issueDate: '2026-10-01',
      payeeName: 'Parkhaus Mitte GmbH',
      payeeAddress: null,
      description: 'Parkgebühr Kundentermin',
      amountCents: 450,
      vatRate: 'REGELSATZ_19',
      reason: 'Parkautomat gab keine Quittung aus',
      paymentMethod: 'BAR',
    })
    expect(push).toHaveBeenCalledWith({ name: 'receipts', state: { saved: 'EB-2026-0004' } })
  })

  it('zeigt die Meldungen des Backends am jeweiligen Feld und bleibt auf der Seite', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          {
            payeeAddress: 'Bei einem Ankaufbeleg ist die Anschrift des Verkäufers Pflicht.',
            issueDate: 'Das Ausstellungsdatum darf nicht vor dem Datum der Zahlung liegen.',
          },
          400,
        ),
      ),
    )
    const { wrapper, push } = mountForm('ANKAUF')

    await fillRequiredFields(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[data-test="error-payeeAddress"]').text()).toBe(
      'Bei einem Ankaufbeleg ist die Anschrift des Verkäufers Pflicht.',
    )
    expect(wrapper.get('[data-test="error-issueDate"]').text()).toContain('nicht vor dem Datum')
    expect(wrapper.get('[name="payeeAddress"]').attributes('aria-invalid')).toBe('true')
    expect((wrapper.get('[name="payeeName"]').element as HTMLInputElement).value).toBe(
      'Parkhaus Mitte GmbH',
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('lehnt einen ungültigen Betrag ab, ohne das Backend aufzurufen', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = mountForm('ALLGEMEIN')

    await fillRequiredFields(wrapper)
    await wrapper.get('[name="amount"]').setValue('vier Euro')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('[data-test="error-amountCents"]').text()).toContain('z. B. 4,50')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('meldet einen Verbindungsfehler und behält die Eingaben (UC-03, 5a)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch')),
    )
    const { wrapper, push } = mountForm('ALLGEMEIN')

    await fillRequiredFields(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[data-test="save-error"]').text()).toBe(
      'Speichern fehlgeschlagen, bitte erneut versuchen.',
    )
    expect((wrapper.get('[name="amount"]').element as HTMLInputElement).value).toBe('4,50')
    expect(push).not.toHaveBeenCalled()
  })
})
