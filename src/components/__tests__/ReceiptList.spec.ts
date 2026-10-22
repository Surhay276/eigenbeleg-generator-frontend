import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import ReceiptList from '../ReceiptList.vue'
import type { Receipt } from '@/types/receipt'

function receipt(overrides: Partial<Receipt>): Receipt {
  return {
    id: crypto.randomUUID(),
    number: 'EB-2026-0001',
    type: 'ALLGEMEIN',
    issueDate: '2026-10-01',
    paymentDate: '2026-09-30',
    payeeName: 'Parkhaus Mitte GmbH',
    payeeAddress: 'Musterstraße 1, 10115 Berlin',
    description: 'Parkgebühr',
    amountCents: 450,
    vatRate: 'REGELSATZ_19',
    reason: 'Keine Quittung',
    paymentMethod: 'BAR',
    issuerName: null,
    issuerAddress: null,
    createdAt: '2026-10-01T09:15:00Z',
    ownerId: null,
    ...overrides,
  }
}

describe('ReceiptList', () => {
  it('rendert pro Beleg genau eine Zeile', () => {
    const receipts = [
      receipt({ number: 'EB-2026-0001' }),
      receipt({ number: 'EB-2026-0002' }),
      receipt({ number: 'EB-2026-0003' }),
    ]
    const wrapper = mount(ReceiptList, { props: { receipts } })
    expect(wrapper.findAll('[data-test="receipt-row"]')).toHaveLength(receipts.length)
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(false)
  })

  it('formatiert Betrag, Datum und Bezeichnungen deutsch', () => {
    const wrapper = mount(ReceiptList, {
      props: {
        receipts: [
          receipt({
            amountCents: 18000,
            paymentDate: '2026-10-03',
            type: 'ANKAUF',
            vatRate: 'OHNE_UST',
            paymentMethod: 'UEBERWEISUNG',
          }),
        ],
      },
    })
    const row = wrapper.get('[data-test="receipt-row"]').text()
    expect(row).toMatch(/180,00\s€/)
    expect(row).toContain('03.10.2026')
    expect(row).toContain('Ankauf')
    expect(row).toContain('ohne USt')
    expect(row).toContain('Überweisung')
  })

  it('sortiert nach Zahlungsdatum, neueste zuerst', () => {
    const wrapper = mount(ReceiptList, {
      props: {
        receipts: [
          receipt({ number: 'EB-2026-0001', paymentDate: '2026-09-30' }),
          receipt({ number: 'EB-2026-0003', paymentDate: '2026-10-04' }),
          receipt({ number: 'EB-2026-0002', paymentDate: '2026-10-03' }),
        ],
      },
    })
    const numbers = wrapper.findAll('[data-test="receipt-row"] .number').map((td) => td.text())
    expect(numbers).toEqual(['EB-2026-0003', 'EB-2026-0002', 'EB-2026-0001'])
  })

  it('zeigt Anzahl und Summe im Tabellentitel', () => {
    const wrapper = mount(ReceiptList, {
      props: { receipts: [receipt({ amountCents: 450 }), receipt({ amountCents: 500 })] },
    })
    expect(wrapper.get('caption').text()).toMatch(/2 Belege, Summe 9,50\s€/)
  })

  it('zeigt einen Hinweis, wenn es keine Belege gibt', () => {
    const wrapper = mount(ReceiptList, { props: { receipts: [] } })
    expect(wrapper.find('[data-test="empty"]').text()).toContain('Noch keine Belege')
    expect(wrapper.findAll('[data-test="receipt-row"]')).toHaveLength(0)
  })
})
