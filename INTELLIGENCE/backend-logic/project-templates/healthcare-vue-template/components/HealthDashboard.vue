<template>
  <div class="healthdashboard-component">
    <h2>HealthDashboard for healthcare</h2>
    <p>This is a healthcare-specific HealthDashboard component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HealthDashboard',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.healthdashboard-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
