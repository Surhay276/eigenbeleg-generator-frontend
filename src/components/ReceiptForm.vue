<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createReceipt, ValidationError } from '@/api/receipts'
import type { PaymentMethod, ReceiptType, VatRate } from '@/types/receipt'
import { paymentMethodLabel, parseEuroToCents, vatRateLabel } from '@/utils/format'

const props = defineProps<{ type: ReceiptType }>()
const router = useRouter()

const isPurchase = computed(() => props.type === 'ANKAUF')
// Heutiges Datum in der Zeitzone des Browsers als "JJJJ-MM-TT" (schwedisches Format ist ISO)
const today = new Date().toLocaleDateString('sv-SE')

// Vorbelegungen laut UC-03 (19 %, bar) und UC-04 (ohne USt, Grund vorausgefüllt)
const form = reactive({
  paymentDate: '',
  issueDate: today,
  payeeName: '',
  payeeAddress: '',
  description: '',
  amount: '',
  vatRate: (isPurchase.value ? 'OHNE_UST' : 'REGELSATZ_19') as VatRate,
  reason: isPurchase.value ? 'Ankauf von Privatperson ohne Rechnung' : '',
  paymentMethod: 'BAR' as PaymentMethod,
})

const errors = ref<Record<string, string>>({})
const saveError = ref<string | null>(null)
const saving = ref(false)

const labels = computed(() =>
  isPurchase.value
    ? {
        title: 'Neuer Ankaufbeleg',
        paymentDate: 'Kaufdatum',
        payeeName: 'Name des Verkäufers',
        payeeAddress: 'Anschrift des Verkäufers',
        description: 'Gekaufter Artikel',
        amount: 'Kaufpreis (brutto, in Euro)',
      }
    : {
        title: 'Neuer Eigenbeleg',
        paymentDate: 'Datum der Zahlung',
        payeeName: 'Zahlungsempfänger',
        payeeAddress: 'Anschrift des Empfängers (empfohlen)',
        description: 'Art der Aufwendung',
        amount: 'Betrag (brutto, in Euro)',
      },
)

async function save() {
  errors.value = {}
  saveError.value = null

  const amountCents = parseEuroToCents(form.amount)
  if (amountCents === null || amountCents <= 0) {
    errors.value = { amountCents: 'Bitte einen Betrag größer als 0 eingeben, z. B. 4,50.' }
    return
  }

  saving.value = true
  try {
    const saved = await createReceipt({
      type: props.type,
      paymentDate: form.paymentDate,
      issueDate: form.issueDate,
      payeeName: form.payeeName,
      payeeAddress: form.payeeAddress.trim() || null,
      description: form.description,
      amountCents,
      vatRate: form.vatRate,
      reason: form.reason,
      paymentMethod: form.paymentMethod,
    })
    // Zurück zur Liste; sie lädt neu und zeigt den Beleg. Die Nummer geht für die Erfolgsmeldung mit.
    await router.push({ name: 'receipts', state: { saved: saved.number } })
  } catch (e) {
    if (e instanceof ValidationError) {
      errors.value = e.fieldErrors
    } else {
      // Eingaben bleiben erhalten (UC-03, 5a)
      saveError.value = 'Speichern fehlgeschlagen, bitte erneut versuchen.'
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="container">
    <RouterLink to="/" class="back">← Meine Belege</RouterLink>
    <h1>{{ labels.title }}</h1>

    <form class="receipt-form" @submit.prevent="save">
      <label>
        {{ labels.paymentDate }}
        <input
          v-model="form.paymentDate"
          type="date"
          name="paymentDate"
          required
          :max="today"
          :aria-invalid="!!errors.paymentDate"
        />
        <span v-if="errors.paymentDate" class="field-error" data-test="error-paymentDate">
          {{ errors.paymentDate }}
        </span>
      </label>

      <label>
        Ausstellungsdatum
        <input
          v-model="form.issueDate"
          type="date"
          name="issueDate"
          required
          :aria-invalid="!!errors.issueDate"
        />
        <span v-if="errors.issueDate" class="field-error" data-test="error-issueDate">
          {{ errors.issueDate }}
        </span>
      </label>

      <label>
        {{ labels.payeeName }}
        <input
          v-model="form.payeeName"
          name="payeeName"
          required
          maxlength="200"
          :aria-invalid="!!errors.payeeName"
        />
        <span v-if="errors.payeeName" class="field-error" data-test="error-payeeName">
          {{ errors.payeeName }}
        </span>
      </label>

      <label>
        {{ labels.payeeAddress }}
        <textarea
          v-model="form.payeeAddress"
          name="payeeAddress"
          rows="2"
          maxlength="500"
          :required="isPurchase"
          :aria-invalid="!!errors.payeeAddress"
        ></textarea>
        <span v-if="errors.payeeAddress" class="field-error" data-test="error-payeeAddress">
          {{ errors.payeeAddress }}
        </span>
      </label>

      <label>
        {{ labels.description }}
        <input
          v-model="form.description"
          name="description"
          required
          maxlength="500"
          :aria-invalid="!!errors.description"
        />
        <small v-if="isPurchase">Möglichst mit Modell oder Seriennummer</small>
        <span v-if="errors.description" class="field-error" data-test="error-description">
          {{ errors.description }}
        </span>
      </label>

      <label>
        {{ labels.amount }}
        <input
          v-model="form.amount"
          name="amount"
          inputmode="decimal"
          placeholder="4,50"
          required
          :aria-invalid="!!errors.amountCents"
        />
        <span v-if="errors.amountCents" class="field-error" data-test="error-amountCents">
          {{ errors.amountCents }}
        </span>
      </label>

      <label>
        Umsatzsteuer
        <select v-model="form.vatRate" name="vatRate" :aria-invalid="!!errors.vatRate">
          <option v-for="(label, value) in vatRateLabel" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
        <small v-if="isPurchase && form.vatRate !== 'OHNE_UST'" data-test="vat-hint">
          Bei Privatpersonen fällt in der Regel keine Umsatzsteuer an.
        </small>
        <span v-if="errors.vatRate" class="field-error">{{ errors.vatRate }}</span>
      </label>

      <label>
        Grund für den fehlenden Originalbeleg
        <textarea
          v-model="form.reason"
          name="reason"
          rows="2"
          required
          maxlength="500"
          placeholder="Warum gibt es keine Quittung?"
          :aria-invalid="!!errors.reason"
        ></textarea>
        <span v-if="errors.reason" class="field-error" data-test="error-reason">
          {{ errors.reason }}
        </span>
      </label>

      <label>
        Zahlungsart
        <select
          v-model="form.paymentMethod"
          name="paymentMethod"
          :aria-invalid="!!errors.paymentMethod"
        >
          <option v-for="(label, value) in paymentMethodLabel" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
        <span v-if="errors.paymentMethod" class="field-error">{{ errors.paymentMethod }}</span>
      </label>

      <p v-if="saveError" class="status error" role="alert" data-test="save-error">
        {{ saveError }}
      </p>

      <button type="submit" :disabled="saving">
        {{ saving ? 'Wird gespeichert …' : 'Beleg speichern' }}
      </button>
      <p v-if="saving" class="hint" data-test="saving">
        Beim ersten Aufruf kann das bis zu einer Minute dauern.
      </p>
    </form>
  </main>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 0.75rem;
  color: var(--accent);
  text-decoration: none;
}

.receipt-form {
  display: grid;
  gap: 1rem;
  max-width: 640px;
  margin-top: 1rem;
}

label {
  display: grid;
  gap: 0.3rem;
  font-weight: 600;
}

input,
textarea,
select {
  font: inherit;
  font-weight: 400;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
}

[aria-invalid='true'] {
  border-color: var(--error);
}

small,
.hint {
  font-weight: 400;
  color: var(--muted);
  font-size: 0.85rem;
  margin: 0;
}

.field-error {
  font-weight: 400;
  color: var(--error);
  font-size: 0.9rem;
}

button {
  justify-self: start;
  font: inherit;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: var(--accent);
  color: var(--surface);
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
