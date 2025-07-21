<template>
  <div class="financeheader-component">
    <h2>FinanceHeader for finance</h2>
    <p>This is a finance-specific FinanceHeader component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FinanceHeader',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.financeheader-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
