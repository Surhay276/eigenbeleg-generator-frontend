<script setup lang="ts">
import { computed } from 'vue'
import type { Receipt } from '@/types/receipt'
import {
  formatCents,
  formatDate,
  paymentMethodLabel,
  receiptTypeLabel,
  vatRateLabel,
} from '@/utils/format'

const props = defineProps<{
  receipts: Receipt[]
}>()

// Neueste Zahlung zuerst; bei gleichem Datum entscheidet die Belegnummer.
const sortedReceipts = computed(() =>
  [...props.receipts].sort(
    (a, b) => b.paymentDate.localeCompare(a.paymentDate) || b.number.localeCompare(a.number),
  ),
)

const totalCents = computed(() => props.receipts.reduce((sum, r) => sum + r.amountCents, 0))
</script>

<template>
  <section class="receipt-list">
    <p v-if="sortedReceipts.length === 0" class="empty" data-test="empty">
      Noch keine Belege vorhanden.
    </p>

    <div v-else class="table-wrapper">
      <table>
        <caption>
          {{ sortedReceipts.length }}
          {{ sortedReceipts.length === 1 ? 'Beleg' : 'Belege' }}, Summe
          {{ formatCents(totalCents) }}
        </caption>
        <thead>
          <tr>
            <th scope="col">Nummer</th>
            <th scope="col">Zahlung</th>
            <th scope="col">Art</th>
            <th scope="col">Empfänger / Verkäufer</th>
            <th scope="col">Beschreibung</th>
            <th scope="col">Zahlart</th>
            <th scope="col" class="amount">Betrag</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="receipt in sortedReceipts" :key="receipt.id" data-test="receipt-row">
            <td class="number" data-label="Nummer">{{ receipt.number }}</td>
            <td data-label="Zahlung">{{ formatDate(receipt.paymentDate) }}</td>
            <td data-label="Art">
              <span :class="['badge', receipt.type.toLowerCase()]">
                {{ receiptTypeLabel[receipt.type] }}
              </span>
            </td>
            <td data-label="Empfänger">
              {{ receipt.payeeName }}
              <small v-if="receipt.payeeAddress">{{ receipt.payeeAddress }}</small>
            </td>
            <td data-label="Beschreibung">
              {{ receipt.description }}
              <small>Grund: {{ receipt.reason }}</small>
            </td>
            <td data-label="Zahlart">{{ paymentMethodLabel[receipt.paymentMethod] }}</td>
            <td class="amount" data-label="Betrag">
              {{ formatCents(receipt.amountCents) }}
              <small>{{ vatRateLabel[receipt.vatRate] }}</small>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

caption {
  text-align: left;
  padding-bottom: 0.75rem;
  color: var(--muted);
}

th,
td {
  padding: 0.65rem 0.75rem;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--border);
}

th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}

tbody tr:hover {
  background: var(--row-hover);
}

small {
  display: block;
  color: var(--muted);
  font-size: 0.8rem;
}

.number {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-weight: 600;
}

.amount {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.badge {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.allgemein {
  background: var(--badge-general-bg);
  color: var(--badge-general-fg);
}

.badge.ankauf {
  background: var(--badge-purchase-bg);
  color: var(--badge-purchase-fg);
}

.empty {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
  border: 1px dashed var(--border);
  border-radius: 8px;
}

/* Auf schmalen Bildschirmen wird jede Zeile zu einer Karte. */
@media (max-width: 720px) {
  thead {
    display: none;
  }

  table,
  caption,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
  }

  tr {
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    padding: 0.25rem 0;
  }

  td {
    border-bottom: none;
    padding: 0.35rem 0.75rem;
  }

  td::before {
    content: attr(data-label);
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--muted);
  }

  .amount {
    text-align: left;
  }
}
</style>
