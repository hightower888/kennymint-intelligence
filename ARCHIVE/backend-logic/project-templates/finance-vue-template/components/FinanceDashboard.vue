<template>
  <div class="financedashboard-component">
    <h2>FinanceDashboard for finance</h2>
    <p>This is a finance-specific FinanceDashboard component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FinanceDashboard',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.financedashboard-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
