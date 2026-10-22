<script setup lang="ts">
import ReceiptList from './components/ReceiptList.vue'
import { sampleReceipts } from './data/sampleReceipts'
</script>

<template>
  <header class="app-header">
    <div class="container">
      <span class="logo">Eigenbeleg Generator</span>
    </div>
  </header>

  <main class="container">
    <h1>Meine Belege</h1>
    <p class="hint">
      Beispieldaten – die Belege werden später vom Backend geladen und können selbst erstellt
      werden.
    </p>
    <ReceiptList :receipts="sampleReceipts" />
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

.hint {
  margin: 0 0 1.25rem;
  color: var(--muted);
}
</style>
