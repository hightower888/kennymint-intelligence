<template>
  <div class="financecard-component">
    <h2>FinanceCard for finance</h2>
    <p>This is a finance-specific FinanceCard component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FinanceCard',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.financecard-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
