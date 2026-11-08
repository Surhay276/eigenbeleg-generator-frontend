<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ReceiptList from './components/ReceiptList.vue'
import { fetchReceipts } from './api/receipts'
import type { Receipt } from './types/receipt'

const receipts = ref<Receipt[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadReceipts() {
  loading.value = true
  error.value = null
  try {
    receipts.value = await fetchReceipts()
  } catch {
    error.value = 'Die Belege konnten nicht geladen werden. Bitte versuche es erneut.'
  } finally {
    loading.value = false
  }
}

onMounted(loadReceipts)
</script>

<template>
  <header class="app-header">
    <div class="container">
      <span class="logo">Eigenbeleg Generator</span>
    </div>
  </header>

  <main class="container">
    <h1>Meine Belege</h1>
    <p v-if="loading" class="status" data-test="loading">
      Belege werden geladen … Beim ersten Aufruf kann das bis zu einer Minute dauern.
    </p>
    <div v-else-if="error" class="status error" role="alert" data-test="error">
      <p>{{ error }}</p>
      <button type="button" @click="loadReceipts">Erneut laden</button>
    </div>
    <ReceiptList v-else :receipts="receipts" />
  </main>
</template>

<style>
:root {
  --bg: #f7f7f5;
  --surface: #ffffff;
  --text: #1f2328;
  --muted: #5f6670;
  --border: #e3e3df;
  --row-hover: #f2f4f7;
  --accent: #1d4ed8;
  --badge-general-bg: #e0ecff;
  --badge-general-fg: #1d4ed8;
  --badge-purchase-bg: #fdecc8;
  --badge-purchase-fg: #8a4b00;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #15171a;
    --surface: #1d2024;
    --text: #e8e9eb;
    --muted: #a0a6ad;
    --border: #33373d;
    --row-hover: #24282d;
    --accent: #7aa2ff;
    --badge-general-bg: #1e2f52;
    --badge-general-fg: #a9c3ff;
    --badge-purchase-bg: #4a3512;
    --badge-purchase-fg: #f5c97a;
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  line-height: 1.45;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}

.app-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0.9rem 0;
}

.logo {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--accent);
}

main {
  padding-top: 1.5rem;
  padding-bottom: 3rem;
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.6rem;
}

.status {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
}

.status.error {
  color: var(--text);
  border-color: var(--badge-purchase-fg);
}

.status p {
  margin: 0 0 0.75rem;
}

.status button {
  font: inherit;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--accent);
  border-radius: 6px;
  background: var(--surface);
  color: var(--accent);
  cursor: pointer;
}
</style>
