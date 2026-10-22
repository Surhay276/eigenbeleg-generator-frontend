import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import ReceiptList from '../components/ReceiptList.vue'
import { sampleReceipts } from '../data/sampleReceipts'

describe('App', () => {
  it('zeigt die Belegliste mit allen Beispielbelegen', () => {
    const wrapper = mount(App)
    expect(wrapper.find('h1').text()).toBe('Meine Belege')
    expect(wrapper.findComponent(ReceiptList).props('receipts')).toEqual(sampleReceipts)
    expect(wrapper.findAll('[data-test="receipt-row"]')).toHaveLength(sampleReceipts.length)
  })
})
